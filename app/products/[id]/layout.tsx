import type {ReactNode} from "react";
import {notFound} from "next/navigation";
import db from "@/prisma/db.client";
import {parseProductId} from "./product-id";

/**
 * Проверка существования товара до границы loading.tsx.
 *
 * Страница под loading.tsx отдаётся потоком: к её рендеру статус 200 уже
 * отправлен, и notFound() оттуда даёт «мягкий 404». Лейаут сегмента
 * рендерится раньше этой границы — отсюда уходит настоящий 404.
 */
export default async function ProductLayout({children, params}: {children: ReactNode; params: {id: string}}) {
  const productId = parseProductId(params.id);

  if (!productId) {
    notFound();
  }

  const product = await db.products.findFirst({
    where: {id: productId, enabled: true},
    select: {id: true},
  });

  if (!product) {
    notFound();
  }

  return <>{children}</>;
}
