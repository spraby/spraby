'use server'
import db from "@/prisma/db.client";
import Prisma, {CategoryCollectionModel, CategoryModel, CollectionModel, OptionModel} from "@/prisma/types";

/**
 *
 * @param params
 */
export async function findFirst(params?: Prisma.collectionsFindFirstArgs): Promise<CollectionModel | null> {
  return db.collections.findFirst(params)
}

/**
 *
 * @param params
 */
export async function findMany(params?: Prisma.collectionsFindManyArgs): Promise<CollectionModel[]> {
  return db.collections.findMany(params)
}

/**
 *
 * @param params
 * @param conditions
 */
export async function getPage(params = {limit: 10, page: 1, search: ''}, conditions?: Prisma.collectionsFindManyArgs) {
  const where = {
    ...(conditions?.where ?? {}),
    ...(params?.search?.length ? {
      OR: [
        {name: {contains: params.search, mode: 'insensitive'}},
        {title: {contains: params.search, mode: 'insensitive'}}
      ]
    } : {})
  } as Prisma.collectionsWhereInput

  conditions = conditions ? {...conditions, ...(Object.keys(where).length ? {where} : {})} : (Object.keys(where).length ? {where} : {})

  const total = await db.collections.count({where: where})

  const items = await db.collections.findMany({
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
 * @param where
 */
export async function getOptions(where: Prisma.collectionsWhereInput) {
  try {
    const collection = await findFirst({
      where,
      include: {
        CategoryCollection: {
          include: {
            Category: {
              include: {
                CategoryOption: {
                  include: {
                    Option: {
                      include: {
                        Values: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    return (collection?.CategoryCollection ?? []).reduce((acc: OptionModel[], categoryCollection: CategoryCollectionModel) => {
      (categoryCollection.Category?.CategoryOption ?? []).map(option => {
        if (option.Option && !acc?.find(i => i.id === option.Option?.id)) acc.push(option.Option)
      })
      return acc;
    }, [])

  } catch (e) {
    return [];
  }
}
