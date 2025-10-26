'use server'
import db from "@/prisma/db.client";
import Prisma, {ProductModel} from "@/prisma/types";
import type {ProductSort} from "@/types";

/**
 *
 * @param params
 */
export async function findFirst(params?: Prisma.productsFindFirstArgs): Promise<ProductModel | null> {
  return db.products.findFirst(params)
}

/**
 *
 * @param params
 */
export async function findMany(params?: Prisma.productsFindManyArgs): Promise<ProductModel[]> {
  return db.products.findMany(params)
}

/**
 *
 * @param params
 * @param conditions
 */
export async function getPage(params = {limit: 10, page: 1, search: ''}, conditions?: Prisma.productsFindManyArgs) {
  const where = {
    ...(conditions?.where ?? {}),
    ...(params?.search?.length ? {title: {contains: params.search, mode: 'insensitive'}} : {})
  } as Prisma.productsWhereInput

  conditions = conditions ? {...conditions, ...(Object.keys(where).length ? {where} : {})} : (Object.keys(where).length ? {where} : {})

  const total = await db.products.count({where: where})

  const items = await db.products.findMany({
    orderBy: {
      created_at: 'desc',
    },
    ...conditions,
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  })

  return {
    items,
    paginator: {pageSize: params.limit, current: params.page, total, pages: Math.ceil(total / params.limit)},
  }
}

export async function getProductsOnTrend() {
  const productViewCounts = await db.products.findMany({
    select: {
      id: true,
      _count: {
        select: {
          Statistics: {
            where: {
              type: 'view'
            }
          }
        }
      }
    },
    orderBy: {
      Statistics: {
        _count: 'desc'
      }
    },
    take: 32
  });

  const topProductIds = productViewCounts.map(i => i.id);

  const products = await findMany({
    where: {
      enabled: true,
      id: {
        in: topProductIds
      }
    },
    include: {
      Images: {
        include: {
          Image: true
        }
      },
    },
  });

  const productsMap = new Map(products.map(p => [p.id, p]));
  const sortedProducts = topProductIds.map(id => productsMap.get(id)).filter(Boolean) as ProductModel[];

  let limitedProducts = sortedProducts.slice(0, 14);

  if (limitedProducts.length < 14) {
    const fallbackProducts = await findMany({
      where: {
        enabled: true,
        id: {
          notIn: limitedProducts.map(product => product.id)
        }
      },
      include: {
        Images: {
          include: {
            Image: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 14 - limitedProducts.length
    });

    limitedProducts = [...limitedProducts, ...fallbackProducts];
  }

  return limitedProducts.slice(0, 14).map(product => {
    return {
      ...product,
      price: `${product.price}`,
      final_price: `${product.final_price}`,
      Images: product.Images?.map(i => ({
        ...i,
        Image: {
          ...i.Image,
          src: process.env.AWS_IMAGE_DOMAIN + '/' + i.Image?.src
        }
      }))
    }
  }) as (ProductModel & { price: string; final_price: string })[]
}

export async function getLatestProducts(limit = 15) {
  const products = await findMany({
    where: {
      enabled: true
    },
    orderBy: {
      created_at: 'desc'
    },
    take: limit + 20,
    include: {
      Images: {
        include: {
          Image: true
        }
      }
    }
  });

  return products.map(product => ({
    ...product,
    price: `${product.price}`,
    final_price: `${product.final_price}`,
    Images: product.Images?.map(i => ({
      ...i,
      Image: {
        ...i.Image,
        src: i.Image?.src ? `${process.env.AWS_IMAGE_DOMAIN}/${i.Image.src}` : i.Image?.src
      }
    }))
  })).slice(0, limit) as (ProductModel & { price: string; final_price: string })[];
}


/**
 *
 * @param filter
 */
export type PaginatedProducts = {
  items: (ProductModel & { price: string; final_price: string })[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getFilteredProducts(filter: Filter): Promise<PaginatedProducts> {

  const orderBy: Prisma.productsOrderByWithRelationInput = (() => {
    switch (filter.sort) {
      case 'oldest':
        return {created_at: 'asc'};
      case 'price_asc':
        return {final_price: 'asc'};
      case 'price_desc':
        return {final_price: 'desc'};
      case 'newest':
      default:
        return {created_at: 'desc'};
    }
  })();

  const page = filter.page && filter.page > 0 ? filter.page : 1;
  const take = filter.limit && filter.limit > 0 ? filter.limit : undefined;

  const where: Prisma.productsWhereInput = {
    enabled: true,

    Category: {
      ...(!!filter?.categoryHandles?.length ? {
        handle: {
          in: filter.categoryHandles
        }
      } : {}),
      ...(!!filter?.collectionHandles?.length ? {
        CategoryCollection: {
          some: {
            Collection: {
              handle: {
                in: filter.collectionHandles,
              },
            },
          }
        },
      } : {}),
      ...(!!filter?.options?.length ? {
        CategoryOption: {
          some: {
            Option: {
              id: {
                in: filter.options.map(i => +i.optionId)
              }
            }
          }
        }
      } : {}),
    },

    ...(!!filter?.options?.length ? {
      Variants: {
        some: {
          AND: filter.options.map(i => ({
            VariantValue: {
              some: {
                Value: {
                  option_id: +i.optionId,
                  value: {
                    in: i.values
                  }
                }
              }
            },
            enabled: true,
          }))
        }
      }
    } : {})
  };

  const [products, total] = await Promise.all([
    findMany({
      where,
      include: {
        Brand: {
          include: {
            User: true
          }
        },
        Category: {
          include: {
            CategoryOption: {
              include: {
                Option: true
              }
            }
          }
        },
        Variants: {
          include: {
            Image: true,
            VariantValue: {
              include: {
                Value: true,
                Option: true
              }
            }
          }
        },
        Images: {
          include: {
            Image: true
          }
        }
      },
      orderBy,
      ...(take ? {skip: (page - 1) * take, take} : {}),
    }),
    db.products.count({where}),
  ]);

  const mappedProducts = products.map(product => {
    return {
      ...product,
      price: `${product.price}`,
      final_price: `${product.final_price}`,
      Variants: product.Variants?.map(v => ({
        ...v,
        price: `${v.price}`,
        final_price: `${v.final_price}`
      })),
      Images: product.Images?.map(i => ({
        ...i,
        Image: {
          ...i.Image,
          src: process.env.AWS_IMAGE_DOMAIN + '/' + i.Image?.src
        }
      }))
    };
  }) as (ProductModel & { price: string; final_price: string })[];

  return {
    items: mappedProducts,
    total,
    page,
    pageSize: take ?? mappedProducts.length,
  };
}

type Filter = {
  categoryHandles?: string[],
  collectionHandles?: string[],
  options?: {
    optionId: number,
    values: string[]
  }[],
  sort?: ProductSort,
  limit?: number,
  page?: number
}
