'use client';

import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import {useSearchParams} from "next/navigation";
import type {ProductSort} from "@/types";
import {useCallback, useRef} from "react";

type SearchItem = {
  id: number | string;
  title: string;
  description: string | null;
  brand: string | null;
  image: string | null;
  price: string;
  final_price: string;
};

type SearchResponse = {
  items: SearchItem[];
  total: number;
  page: number;
  pages: number;
};

const normalizeEntries = (params: URLSearchParams | null) => {
  if (!params) return [];
  const uniqueKeys = Array.from(new Set(params.keys()));
  return uniqueKeys.map(key => ({
    key,
    value: params.getAll(key).join(', ')
  }));
};

const formatPrice = (price: string, finalPrice: string) => {
  const base = Number(price);
  const final = Number(finalPrice);
  if (Number.isFinite(base) && Number.isFinite(final)) {
    const hasDiscount = final < base;
    return {
      text: hasDiscount ? `${final} BYN` : `${base} BYN`,
      old: hasDiscount ? `${base} BYN` : null,
    };
  }
  return {text: finalPrice || price || "—", old: null};
};

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = useMemo(() => (searchParams?.get("q") ?? "").trim(), [searchParams]);
  const initialSort = useMemo<ProductSort>(() => (searchParams?.get("sort") as ProductSort) ?? "newest", [searchParams]);
  const querySummary = useMemo(() => normalizeEntries(searchParams), [searchParams]);

  const [results, setResults] = useState<SearchItem[]>([]);
  const [meta, setMeta] = useState<{total: number; page: number; pages: number}>({total: 0, page: 1, pages: 0});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState<ProductSort>(initialSort);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const formatNumber = (value: number) => new Intl.NumberFormat('ru-RU').format(value);
  const sortOptions: { value: ProductSort; label: string }[] = [
    {value: 'newest', label: 'Актуальности'},
    {value: 'price_asc', label: 'Цене: сначала низкая'},
    {value: 'price_desc', label: 'Цене: сначала высокая'},
    {value: 'oldest', label: 'Дате добавления'},
  ];

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || loading) return;
    const nextPage = meta.page + 1;
    setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20&page=${nextPage}&sort=${encodeURIComponent(sort)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SearchResponse = await res.json();
      setResults(prev => [...prev, ...(data.items ?? [])]);
      setMeta({total: data.total, page: data.page, pages: data.pages});
      setHasMore(data.page < data.pages);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, loading, meta.page, query, sort]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const run = async () => {
      if (!query.length) {
        setResults([]);
        setMeta({total: 0, page: 1, pages: 0});
        setHasMore(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20&page=1&sort=${encodeURIComponent(sort)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: SearchResponse = await response.json();
        if (!isMounted) return;
        setResults(data.items);
        setMeta({total: data.total, page: data.page, pages: data.pages});
        setHasMore(data.page < data.pages);
      } catch (err) {
        if (!isMounted || (err instanceof DOMException && err.name === "AbortError")) return;
        setError("Не удалось выполнить поиск. Попробуйте ещё раз.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [query, sort]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        void loadMore();
      }
    }, {rootMargin: '300px'});

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <main className="px-4 pt-6 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Поиск
          </h1>
          <Link
            href="/"
            className="text-sm font-semibold text-purple-600 transition hover:text-purple-700"
          >
            На главную
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          {querySummary.length === 0 ? (
            <p className="text-sm text-gray-500">
              Воспользуйтесь поиском на сайте, чтобы найти товары по названию или описанию.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Параметры поиска:
              </span>
              <ul className="flex flex-wrap gap-2">
                {querySummary.map(item => (
                  <li
                    key={item.key}
                    className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700"
                  >
                    <span className="uppercase tracking-wide text-purple-400">{item.key}</span>
                    <span className="text-purple-700">{item.value || '—'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {loading && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-6 text-sm text-gray-500">
            Ищем товары…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && query.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-end gap-2 self-end text-right">
              <p className="text-base font-semibold text-purple-600">{formatNumber(meta.total)} результатов</p>
              <p className="text-sm text-gray-500">Показано {formatNumber(results.length)} из {formatNumber(meta.total)}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="font-medium whitespace-nowrap">Сортировка по:</span>
                <div className="relative inline-flex items-center">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm font-semibold text-gray-800 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    aria-label="Сортировка результатов"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <ChevronDownMiniIcon/>
                  </span>
                </div>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
                Ничего не найдено. Попробуйте другой запрос.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {results.map((item) => {
                    const price = formatPrice(item.price, item.final_price);
                    const hasDiscount = Number(item.final_price) < Number(item.price);
                    const discountPercent = hasDiscount
                      ? Math.max(1, Math.round((1 - Number(item.final_price) / Number(item.price)) * 100))
                      : 0;
                    return (
                      <Link
                        key={item.id}
                        href={`/products/${item.id}`}
                        className="group flex h-full flex-col gap-2 rounded-[0.375rem] bg-white p-2 shadow-sm"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-[0.375rem] border border-gray-200/60 bg-gray-50">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              Нет фото
                            </div>
                          )}
                          {hasDiscount && discountPercent > 0 && (
                            <span className="absolute right-2 top-2 inline-flex items-center rounded-[0.375rem] bg-purple-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                              -{discountPercent}%
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-1 px-1">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                          {item.brand && <p className="text-xs text-gray-500 truncate">{item.brand}</p>}
                          {item.description && (
                            <p className="line-clamp-2 text-xs text-gray-500">{stripHtml(item.description)}</p>
                          )}
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-base font-semibold text-purple-500">{price.text}</span>
                            {price.old && <span className="text-xs text-gray-400 line-through">{price.old}</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div ref={sentinelRef} className="h-1 w-full"/>

                {isLoadingMore && (
                  <div className="flex justify-center py-4 text-sm text-gray-500">
                    Подгружаем ещё…
                  </div>
                )}

                {!loading && !isLoadingMore && !hasMore && (
                  <div className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Показаны все результаты
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, "");

const ChevronDownMiniIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="M4.5 6.5L8 10l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
