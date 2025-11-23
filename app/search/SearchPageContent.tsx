'use client';

import Link from "next/link";
import {useMemo} from "react";
import {useSearchParams} from "next/navigation";

const normalizeEntries = (params: URLSearchParams | null) => {
  if (!params) return [];
  const uniqueKeys = Array.from(new Set(params.keys()));
  return uniqueKeys.map(key => ({
    key,
    value: params.getAll(key).join(', ')
  }));
};

export default function SearchPageContent() {
  const searchParams = useSearchParams();

  const querySummary = useMemo(() => normalizeEntries(searchParams), [searchParams]);

  return (
    <main className="px-4 pt-6 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
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

        {querySummary.length === 0 ? (
          <p className="text-sm text-gray-500">
            Воспользуйтесь поиском на сайте, чтобы найти нужные товары или категории.
          </p>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Активные параметры:
            </span>
            <ul className="mt-3 flex flex-wrap gap-2">
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

        <p className="text-sm text-gray-500">
          Страница поиска находится в разработке. Здесь появятся результаты и фильтры, которые помогут
          быстрее находить нужные товары и мастеров.
        </p>
      </div>
    </main>
  );
}
