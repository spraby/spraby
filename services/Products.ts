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
export async function getFilteredProducts(filter: Filter): Promise<ProductModel[]> {
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
          Collections: {
            some: {
              collection: {
                handle: {
                  in: filter.collectionHandles,
                },
              },
            }
          },
        } : {}),

        ...(!!filter?.options?.length ? {
          Options: {
            some: {
              option: {
                id: {
                  in: filter.options.map(i => i.optionId)
                }
              }
            }
          }
        } : {})
      },
      ...(!!filter?.options?.length ? {
        Variants: {
          some: {
            AND: filter.options.map(i => ({
              Values: {
                some: {
                  Value: {
                    optionId: i.optionId,
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
          Options: true
        }
      },
      Variants: {
        include: {
          Image: true,
          Values: {
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
      Images: product.Images?.map(i => ({
        ...i,
        Image: {
          ...i.Image,
          src: process.env.AWS_IMAGE_DOMAIN + '/' + i.Image?.src
        }
      }))
    }
  }) as ProductModel[]
}

type Filter = {
  categoryHandles?: string[],
  collectionHandles?: string[],
  options?: {
    optionId: number,
    values: string[]
  }[]
}
