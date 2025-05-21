'use server'
import db from "@/prisma/db.client";
import Prisma, {ProductModel} from "@/prisma/types";

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

/**
 *
 * @param filter
 */
export async function getFilteredProducts(filter: Filter): Promise<(ProductModel & {
  price: string;
  final_price: string
})[]> {


  console.log('collectionHandles => ', filter?.collectionHandles)
  console.log('categoryHandles => ', filter?.categoryHandles)
  console.log('filterOptions => ', filter.options)

  console.log('QUERY', JSON.stringify({
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
            }
          }))
        }
      }
    } : {})
  }, null, 2))

  const products = await findMany({
    where: {
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
              }
            }))
          }
        }
      } : {})
    },
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
    orderBy: {
      created_at: 'asc'
    }
  });

  return products.map(product => {
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
    }
  }) as (ProductModel & { price: string; final_price: string })[]
}

type Filter = {
  categoryHandles?: string[],
  collectionHandles?: string[],
  options?: {
    optionId: number,
    values: string[]
  }[]
}
