'use server'
import db from "@/prisma/db.client";
import Prisma, {CategoryModel, OptionModel} from "@/prisma/types";

/**
 *
 * @param params
 */
export async function findFirst(params?: Prisma.CategoryFindFirstArgs): Promise<CategoryModel | null> {
  return db.category.findFirst(params)
}

/**
 *
 * @param params
 * @param conditions
 */
export async function getPage(params = {limit: 10, page: 1, search: ''}, conditions?: Prisma.CategoryFindManyArgs) {
  const where = {
    ...(conditions?.where ?? {}),
    ...(params?.search?.length ? {
      OR: [
        {name: {contains: params.search, mode: 'insensitive'}},
        {title: {contains: params.search, mode: 'insensitive'}}
      ]
    } : {})
  } as Prisma.CategoryWhereInput

  conditions = conditions ? {...conditions, ...(Object.keys(where).length ? {where} : {})} : (Object.keys(where).length ? {where} : {})

  const total = await db.category.count({where: where})

  const items = await db.category.findMany({
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
export async function getOptions(where: Prisma.CategoryWhereInput) {
  try {
    const category = await findFirst({
      where,
      include: {
        Options: {
          include: {
            Values: true
          }
        }
      }
    })

    return (category?.Options ?? []).reduce((acc: OptionModel[], option) => {
      if (!acc?.find(i => i.id === option.id)) acc.push(option)
      return acc;
    }, [])

  } catch (e) {
    return [];
  }
}
