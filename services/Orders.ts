'use server'
import db from "@/prisma/db.client";
import Prisma, {OrderModel} from "@/prisma/types";

/**
 *
 * @param params
 */
export async function create(params: Prisma.ordersCreateArgs) {
  return db.orders.create(params)
}

/**
 *
 * @param params
 */
export async function findFirst(params?: Prisma.ordersFindFirstArgs): Promise<OrderModel | null> {
  return db.orders.findFirst(params)
}
