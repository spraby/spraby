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
  <div className="pointer-events-none relative mt-5 flex h-[110px] w-[70%] max-w-[160px] items-center justify-center rounded-[0.375rem] bg-[#eceaf9] text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d3d0ed] md:mt-8 md:h-[130px]">
    изображение
  </div>
);

export default function PopularCategories({items}: Props) {
  if (!items.length) return null;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-gray-900 md:text-[26px]">Популярные категории</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="group relative flex h-full min-h-[170px] flex-col justify-between rounded-[0.375rem] bg-[#f2f1ff] px-5 py-5 text-gray-900 md:min-h-[190px] md:px-6 md:py-6"
          >
            <header className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold md:text-lg">{item.title}</h3>
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
