import {PrismaClient} from '@prisma/client'

declare global {
  var prisma: PrismaClient
}

const db: PrismaClient = global.prisma || new PrismaClient()

export default db
