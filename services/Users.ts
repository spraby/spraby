'use server'

import db from "@/prisma/db.client";
import Prisma, {UserModel} from "@/prisma/types";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

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

/**
 * Find user by email and phone
 * @param email
 * @param phone
 */
export async function findByEmailAndPhone(email: string, phone: string) {
  return db.users.findFirst({
    where: {
      email,
      phone,
    },
    include: {Brands: true}
  }) as Promise<UserModel | null>
}

/**
 * Generate a 6-digit reset code
 */
function generateResetCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Create password reset token for user
 * @param userId
 * @param expiresInMinutes
 */
export async function createPasswordResetToken(userId: bigint, expiresInMinutes: number = 30) {
  const resetCode = generateResetCode()
  const hashedCode = await bcrypt.hash(resetCode, 10)
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

  await db.users.update({
    where: {id: userId},
    data: {
      password_reset_token: hashedCode,
      password_reset_expires: expiresAt
    }
  })

  return resetCode
}

/**
 * Verify password reset code
 * @param email
 * @param code
 */
export async function verifyResetCode(email: string, code: string) {
  const user = await db.users.findFirst({
    where: {email}
  })

  if (!user || !user.password_reset_token || !user.password_reset_expires) {
    return {valid: false, error: 'invalid_code'}
  }

  if (new Date() > user.password_reset_expires) {
    return {valid: false, error: 'code_expired'}
  }

  const isValid = await bcrypt.compare(code, user.password_reset_token)
  if (!isValid) {
    return {valid: false, error: 'invalid_code'}
  }

  return {valid: true, userId: user.id}
}

/**
 * Reset user password
 * @param userId
 * @param newPassword
 */
export async function resetPassword(userId: bigint, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await db.users.update({
    where: {id: userId},
    data: {
      password: hashedPassword,
      password_reset_token: null,
      password_reset_expires: null
    }
  })

  return true
}

/**
 * Clear expired reset tokens (cleanup utility)
 */
export async function clearExpiredResetTokens() {
  await db.users.updateMany({
    where: {
      password_reset_expires: {
        lt: new Date()
      }
    },
    data: {
      password_reset_token: null,
      password_reset_expires: null
    }
  })
}
