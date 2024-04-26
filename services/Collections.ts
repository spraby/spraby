'use server'
import db from "@/prisma/db.client";
import Prisma, {CategoryModel, CollectionModel, OptionModel} from "@/prisma/types";

/**
 *
 * @param params
 */
export async function findFirst(params?: Prisma.CollectionFindFirstArgs): Promise<CollectionModel | null> {
  return db.collection.findFirst(params)
}

/**
 *
 * @param params
 */
export async function findMany(params?: Prisma.CollectionFindManyArgs): Promise<CollectionModel[]> {
  return db.collection.findMany(params)
}

/**
 *
 * @param params
 * @param conditions
 */
export async function getPage(params = {limit: 10, page: 1, search: ''}, conditions?: Prisma.CollectionFindManyArgs) {
  const where = {
    ...(conditions?.where ?? {}),
    ...(params?.search?.length ? {
      OR: [
        {name: {contains: params.search, mode: 'insensitive'}},
        {title: {contains: params.search, mode: 'insensitive'}}
      ]
    } : {})
  } as Prisma.CollectionWhereInput

  conditions = conditions ? {...conditions, ...(Object.keys(where).length ? {where} : {})} : (Object.keys(where).length ? {where} : {})

  const total = await db.collection.count({where: where})

  const items = await db.collection.findMany({
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
 * @param where
 */
export async function getOptions(where: Prisma.CollectionWhereInput) {
  try {
    const collection = await findFirst({
      where,
      include: {
        Categories: {
          include: {
            Options: {
              include: {
                Values: true
              }
            }
          }
        }
      }
    })

    return (collection?.Categories ?? []).reduce((acc: OptionModel[], category: CategoryModel) => {
      (category?.Options ?? []).map(option => {
        if (!acc?.find(i => i.id === option.id)) acc.push(option)
      })
      return acc;
    }, [])

  } catch (e) {
    return [];
  }
}
