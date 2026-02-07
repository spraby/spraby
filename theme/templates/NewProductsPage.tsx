'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import ProductCart from "@/theme/snippents/ProductCart";
import {ProductCardModel} from "@/prisma/types";

const PAGE_SIZE = 20;

export default function NewProductsPage({products}: { products: ProductCardModel[] }) {
  const [visible, setVisible] = useState<ProductCardModel[]>(() => products.slice(0, PAGE_SIZE));
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const total = products.length;
  const shown = visible.length;
  const hasMore = shown < total;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    const nextPage = page + 1;
    const nextItems = products.slice(0, nextPage * PAGE_SIZE);
    setVisible(nextItems);
    setPage(nextPage);
  }, [hasMore, page, products]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        loadMore();
      }
    }, {rootMargin: '300px'});

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const formattedTotal = useMemo(() => new Intl.NumberFormat('ru-RU').format(total), [total]);
  const formattedShown = useMemo(() => new Intl.NumberFormat('ru-RU').format(shown), [shown]);

  return (
    <main className="px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Новинки</h1>
            <p className="text-sm text-gray-500">Последние добавленные товары</p>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm text-gray-600">
            <span className="text-base font-semibold text-purple-600">{formattedTotal} результатов</span>
            <span className="text-xs text-gray-500">Показано {formattedShown} из {formattedTotal}</span>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">
            Пока нет новых товаров.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {visible.map((product) => (
                <ProductCart key={`new-${String(product.id)}`} product={product}/>
              ))}
            </div>
            <div ref={sentinelRef} className="h-1 w-full"/>
            {!hasMore && (
              <div className="text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                Показаны все товары
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
