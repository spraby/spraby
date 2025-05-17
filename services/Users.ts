'use server'

import db from "@/prisma/db.client";
import Prisma, {UserModel} from "@/prisma/types";

/**
 *
 * @param params
 * @param conditions
 */
export async function getPage(params = {limit: 10, page: 1, search: ''}, conditions?: Prisma.usersFindManyArgs) {
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
  } as Prisma.usersWhereInput

  conditions = conditions ? {...conditions, ...(Object.keys(where).length ? {where} : {})} : (Object.keys(where).length ? {where} : {})

  const total = await db.users.count({where: where})

  const items = await db.users.findMany({
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
 */
export async function getList() {
  return db.users.findMany() as Promise<UserModel[]>
}

/**
 *
 * @param email
 */
export async function findByEmail(email: string) {
  return db.users.findFirst({where: {email}, include: {Brands: true}}) as Promise<UserModel | null>
}

/**
 *
 * @param id
 */
export async function findById(id: bigint) {
  return db.users.findFirst({where: {id}}) as Promise<UserModel | null>
}
