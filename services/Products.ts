'use server'
import db from "@/prisma/db.client";
import Prisma, {ProductModel} from "@/prisma/types";

/**
 *
 * @param params
 */
export async function findFirst(params?: Prisma.ProductFindFirstArgs): Promise<ProductModel | null> {
  return db.product.findFirst(params)
}

/**
 *
 * @param params
 */
export async function findMany(params?: Prisma.ProductFindManyArgs): Promise<ProductModel[]> {
  return db.product.findMany(params)
}

/**
 *
 * @param params
 * @param conditions
 */
export async function getPage(params = {limit: 10, page: 1, search: ''}, conditions?: Prisma.ProductFindManyArgs) {
  const where = {
    ...(conditions?.where ?? {}),
    ...(params?.search?.length ? {title: {contains: params.search, mode: 'insensitive'}} : {})
  } as Prisma.ProductWhereInput

  conditions = conditions ? {...conditions, ...(Object.keys(where).length ? {where} : {})} : (Object.keys(where).length ? {where} : {})

  const total = await db.product.count({where: where})

  const items = await db.product.findMany({
    orderBy: {
      createdAt: 'desc',
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
export async function getFilteredProducts(filter: Filter) {
  return findMany({
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
              handle: {
                in: filter.collectionHandles
              }
            }
          },
        } : {}),

        ...(!!filter?.options?.length ? {
          Options: {
            some: {
              id: {
                in: filter.options.map(i => i.optionId)
              }
            }
          }
        } : {})
      },
      ...(!!filter?.options?.length ? {
        Variants: {
          some: {
            Values: {
              some: {
                OR: filter.options.map(i => ({
                  Value: {
                    optionId: i.optionId,
                    value: {
                      in: i.values
                    }
                  }
                }))
              }
            }
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
      createdAt: 'asc'
    }
  })
}

type Filter = {
  categoryHandles?: string[],
  collectionHandles?: string[],
  options?: {
    optionId: string,
    values: string[]
  }[]
}
