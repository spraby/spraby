'use client';

import Link from 'next/link';

export type PopularCategory = {
  id: string;
  title: string;
  href: string;
};

type Props = {
  items: PopularCategory[];
};

const PLACEHOLDER = (
  <div className="pointer-events-none relative mt-6 flex h-[140px] w-[70%] max-w-[180px] items-center justify-center rounded-[24px] bg-[#eceaf9] text-xs font-semibold uppercase tracking-[0.3em] text-[#d3d0ed] md:mt-10 md:h-[160px]">
    изображение
  </div>
);

export default function PopularCategories({items}: Props) {
  if (!items.length) return null;

  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold text-gray-900 md:text-[28px]">Популярные категории</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="group relative flex h-full min-h-[220px] flex-col justify-between rounded-[28px] bg-[#f2f1ff] px-6 py-6 text-gray-900 shadow-[0_20px_40px_-45px_rgba(118,67,212,0.35)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_25px_45px_-40px_rgba(118,67,212,0.45)] md:min-h-[240px] md:px-8 md:py-8"
          >
            <header className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold md:text-xl">{item.title}</h3>
            </header>

            {PLACEHOLDER}

            <footer className="pt-4">
              <Link
                href={item.href}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#7c3aed] transition-colors duration-200 group-hover:text-[#6d31da]"
              >
                Смотреть
                <span aria-hidden className="text-base">›</span>
              </Link>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
