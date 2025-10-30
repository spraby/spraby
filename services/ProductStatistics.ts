'use server'
import db from "@/prisma/db.client";
import {handlePrismaError} from "@/prisma/safeCall";
import {cookies} from "next/headers";

/**
 *
 * @param params
 */
const setEvent = async (params: {
  product_id: bigint,
  client_id: string,
  type: 'view' | 'click' | 'add_to_cart'
}) => {
  try {
    await db.productStatistics.upsert({
      where: {
        statistics: params
      },
      create: {
        ...params,
        geo: {}
      },
      update: {
        geo: {},
      }
    });
  } catch (error) {
    handlePrismaError<void>(error, undefined, 'productStatistics.setEvent');
  }
};


export async function setStatistic(productId: bigint, type: 'view' | 'click' | 'add_to_cart') {

  console.log('TYPE => ', type, productId);

  //_sp_psv - view
  //_sp_psc - click
  //_sp_psatc - add to cart
  const events = ['_sp_psv', '_sp_psc', '_sp_psatc'];
  const event = events.find(i => !isExists(i)?.isNew);

  if (!event) return;

  await setEvent({
    product_id: productId,
    client_id: isExists(event).clientId,
    type
  });

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
