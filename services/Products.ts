'use server'
import db from "@/prisma/db.client";
import {handlePrismaError, safePrismaCall} from "@/prisma/safeCall";
import Prisma, {ProductModel} from "@/prisma/types";
import type {ProductSort} from "@/types";

/**
 *
 * @param params
 */
export async function findFirst(params?: Prisma.productsFindFirstArgs): Promise<ProductModel | null> {
  try {
    return await db.products.findFirst(params);
  } catch (error) {
    return handlePrismaError<ProductModel | null>(error, null, 'products.findFirst');
  }
}

/**
 *
 * @param params
 */
export async function findMany(params?: Prisma.productsFindManyArgs): Promise<ProductModel[]> {
  try {
    return await db.products.findMany(params);
  } catch (error) {
    return handlePrismaError<ProductModel[]>(error, [], 'products.findMany');
  }
}

/**
 *
 * @param params
 * @param conditions
 */
export async function getPage(params = {limit: 10, page: 1, search: ''}, conditions?: Prisma.productsFindManyArgs) {
  const normalized = {
    limit: params?.limit ?? 10,
    page: params?.page ?? 1,
    search: params?.search ?? ''
  };

  const fallback = {
    items: [] as ProductModel[],
    paginator: {
      pageSize: normalized.limit,
      current: normalized.page,
      total: 0,
      pages: 0
    }
  };

  try {
    const where = {
      ...(conditions?.where ?? {}),
      ...(normalized.search.length ? {title: {contains: normalized.search, mode: 'insensitive'}} : {})
    } as Prisma.productsWhereInput;

    const mergedConditions = conditions
      ? {...conditions, ...(Object.keys(where).length ? {where} : {})}
      : (Object.keys(where).length ? {where} : {});

    const total = await safePrismaCall(
      () => db.products.count({where}),
      0,
      'products.getPage.count'
    );

    const items = await findMany({
      orderBy: {
        created_at: 'desc',
      },
      ...mergedConditions,
      skip: (normalized.page - 1) * normalized.limit,
      take: normalized.limit,
    });

    return {
      items,
      paginator: {
        pageSize: normalized.limit,
        current: normalized.page,
        total,
        pages: normalized.limit ? Math.ceil(total / normalized.limit) : 0
      },
    };
  } catch (error) {
    return handlePrismaError(error, fallback, 'products.getPage');
  }
}

export async function getProductsOnTrend() {
  try {
    const productViewCounts = await safePrismaCall(
      () => db.products.findMany({
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
      }),
      [],
      'products.getProductsOnTrend.viewCounts'
    );

    const topProductIds = productViewCounts.map(i => i.id);

    const products = await findMany({
      where: {
        enabled: true,
        id: {
          in: topProductIds
        },
        Images: {
          some: {}
        }
      },
      include: {
        Brand: {
          include: {
            User: true
          }
        },
        Images: {
          include: {
            Image: true
          }
        },
      },
    });

    const productsMap = new Map(products.map(p => [p.id, p]));
    const sortedProducts = topProductIds.map(id => productsMap.get(id)).filter(Boolean) as ProductModel[];

    let limitedProducts = sortedProducts.slice(0, 19);

    if (limitedProducts.length < 19) {
      const fallbackProducts = await findMany({
        where: {
          enabled: true,
          id: {
            notIn: limitedProducts.map(product => product.id)
          }
        },
        include: {
          Brand: {
            include: {
              User: true
            }
          },
          Images: {
            include: {
              Image: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 19 - limitedProducts.length
      });

      limitedProducts = [...limitedProducts, ...fallbackProducts];
    }

    return limitedProducts.slice(0, 19).map(product => {
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
      };
    }) as (ProductModel & { price: string; final_price: string })[];
  } catch (error) {
    return handlePrismaError<(ProductModel & { price: string; final_price: string })[]>(error, [], 'products.getProductsOnTrend');
  }
}

export async function getTrendingProducts(limit = 100) {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const productViewCounts = await safePrismaCall(
      () => db.productStatistics.groupBy({
        by: ['product_id'],
        where: {
          type: 'view',
          created_at: {
            gte: since
          }
        },
        _count: {
          product_id: true
        },
        orderBy: {
          _count: {
            product_id: 'desc'
          }
        },
        take: limit
      }),
      [],
      'products.getTrendingProducts.views'
    );

    const topIds = productViewCounts.map(view => typeof view.product_id === 'bigint' ? view.product_id : BigInt(view.product_id));
    if (!topIds.length) return [];

    const products = await findMany({
      where: {
        enabled: true,
        id: {
          in: topIds
        }
      },
      include: {
        Brand: {
          include: {
            User: true
          }
        },
        Images: {
          include: {
            Image: true
          }
        }
      }
    });

    const productMap = new Map(products.map(p => [p.id?.toString(), p]));
    const sortedProducts = topIds
      .map(id => productMap.get(id.toString()))
      .filter(Boolean) as ProductModel[];

    return sortedProducts.map(product => ({
      ...product,
      price: `${product.price}`,
      final_price: `${product.final_price}`,
      Images: product.Images?.map(i => ({
        ...i,
        Image: i.Image ? {
          ...i.Image,
          src: i.Image?.src ? `${process.env.AWS_IMAGE_DOMAIN}/${i.Image.src}` : i.Image?.src
        } : null
      }))
    }));
  } catch (error) {
    return handlePrismaError<ProductModel[]>(error, [], 'products.getTrendingProducts');
  }
}

export async function getLatestProducts(limit = 15) {
  try {
    const products = await findMany({
      where: {
        enabled: true,
        Images: {
          some: {}
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit,
      include: {
        Brand: {
          include: {
            User: true
          }
        },
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
    })) as (ProductModel & { price: string; final_price: string })[];
  } catch (error) {
    return handlePrismaError<(ProductModel & { price: string; final_price: string })[]>(error, [], 'products.getLatestProducts');
  }
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

  const fallback: PaginatedProducts = {
    items: [],
    total: 0,
    page,
    pageSize: take ?? 0,
  };

  try {
    const where: Prisma.productsWhereInput = {
      enabled: true,
      Category: {
        ...(filter?.categoryHandles?.length ? {
          handle: {
            in: filter.categoryHandles
          }
        } : {}),
        ...(filter?.collectionHandles?.length ? {
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
        ...(filter?.options?.length ? {
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
      ...(filter?.options?.length ? {
        Variants: {
          some: {
            enabled: true,
            AND: filter.options.map(option => ({
              VariantValue: {
                some: {
                  Value: {
                    option_id: +option.optionId,
                    value: {
                      in: option.values
                    }
                  }
                }
              }
            }))
          }
        }
      } : {}),
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
      safePrismaCall(() => db.products.count({where}), 0, 'products.getFilteredProducts.count'),
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
  } catch (error) {
    return handlePrismaError(error, fallback, 'products.getFilteredProducts');
  }
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
