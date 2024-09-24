'use server'
import db from "@/prisma/db.client";
import Prisma from "@/prisma/types";

/**
 *
 * @param params
 */
export async function create(params: Prisma.OrderCreateArgs) {
  return db.order.create(params)
}
