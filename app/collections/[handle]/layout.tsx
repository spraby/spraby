import type {ReactNode} from "react";
import {notFound} from "next/navigation";
import db from "@/prisma/db.client";

/**
 * Проверка существования подборки до границы loading.tsx: страница под ней
 * отдаётся потоком, и notFound() оттуда даёт «мягкий 404» со статусом 200.
 * Лейаут сегмента рендерится раньше — отсюда уходит настоящий 404.
 */
export default async function CollectionLayout({children, params}: {children: ReactNode; params: {handle: string}}) {
  const exists = await db.collections.count({where: {handle: params.handle}});

  if (!exists) {
    notFound();
  }

  return <>{children}</>;
}
