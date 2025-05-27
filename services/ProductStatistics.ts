'use server'
import db from "@/prisma/db.client";
import {cookies} from "next/headers";

export async function setStatistic(productId: bigint, type: 'view' | 'click') {
  console.log('TEST!')
  if (type === 'view') {
    const {isNew, clientId} = isExists('_sp_psv');
    console.log('isNew => ', isNew)
    console.log('clientId => ', clientId)
    if (!isNew) return;
    await db.productStatistics.upsert({
      where: {
        statistics: {
          product_id: productId,
          client_id: clientId,
          type: 'view'
        }
      },
      create: {
        product_id: productId,
        client_id: clientId,
        type: 'view',
        geo: {}
      },
      update: {
        geo: {},
      }
    })
  }

  function isExists(key: string): { clientId: string, isNew: boolean } {
    const cookieStore = cookies();
    const clientCookie = cookieStore.get(key);

    if (!clientCookie) {
      const clientId = crypto.randomUUID();

      cookieStore.set(key, clientId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return {
        clientId,
        isNew: true,
      }
    }

    return {
      clientId: clientCookie?.value,
      isNew: false,
    };
  }
}
