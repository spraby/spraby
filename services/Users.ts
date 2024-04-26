'use server'

import db from "@/prisma/db.client";
import Prisma, {UserModel} from "@/prisma/types";

/**
 *
 * @param params
 * @param conditions
 */
export async function getPage(params = {limit: 10, page: 1, search: ''}, conditions?: Prisma.UserFindManyArgs) {
  const where = {
    ...(conditions?.where ?? {}),
    ...(params?.search?.length ? {
      OR: [{
        firstName: {contains: params.search, mode: 'insensitive'}
      }, {
        lastName: {contains: params.search, mode: 'insensitive'}
      }, {
        email: {contains: params.search, mode: 'insensitive'}
      }]
    } : {})
  } as Prisma.UserWhereInput

  conditions = conditions ? {...conditions, ...(Object.keys(where).length ? {where} : {})} : (Object.keys(where).length ? {where} : {})

  const total = await db.user.count({where: where})

  const items = await db.user.findMany({
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
 */
export async function getList() {
  return db.user.findMany() as Promise<UserModel[]>
}

/**
 *
 * @param email
 */
export async function findByEmail(email: string) {
  return db.user.findFirst({where: {email}, include: {Brands: true}}) as Promise<UserModel | null>
}

/**
 *
 * @param id
 */
export async function findById(id: string) {
  return db.user.findFirst({where: {id, role: {not: 'admin'}}}) as Promise<UserModel | null>
}
