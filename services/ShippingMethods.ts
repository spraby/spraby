'use server'
import db from "@/prisma/db.client";
import {serializeObject} from "@/services/utilits";

/**
 * Способы доставки, подключённые брендами: brand_id → shipping_methods
 * (с конструктором для названия/описания). Используется на чекауте,
 * где в корзине только id брендов. Способы деактивированных админом
 * конструкторов не продаются, поэтому отфильтрованы на уровне запроса.
 */
export async function getShippingMethodsByBrandIds(brandIds: string[]): Promise<Record<string, any[]>> {
  // Мусор из localStorage-корзины (undefined/null/нечисловые id) не должен ронять запрос
  const validIds = brandIds.filter(id => /^\d+$/.test(id));
  if (!validIds.length) return {};

  const rows = await db.brand_shipping_method.findMany({
    where: {
      brand_id: {in: validIds.map(id => BigInt(id))},
      shipping_methods: {
        shipping_method_constructors: {active: true}
      }
    },
    include: {
      shipping_methods: {
        include: {
          shipping_method_constructors: true
        }
      }
    }
  });

  return rows.reduce((acc, row) => {
    const brandId = String(row.brand_id);
    if (!acc[brandId]) acc[brandId] = [];
    acc[brandId].push(serializeObject(row.shipping_methods));
    return acc;
  }, {} as Record<string, any[]>);
}
