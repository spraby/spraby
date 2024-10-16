'use server'
import db from "@/prisma/db.client";
import Prisma, {OrderModel} from "@/prisma/types";

/**
 *
 * @param params
 */
export async function create(params: Prisma.OrderCreateArgs) {
  return db.order.create(params)
}

/**
 *
 * @param params
 */
export async function findFirst(params?: Prisma.OrderFindFirstArgs): Promise<OrderModel | null> {
  return db.order.findFirst(params)
}
