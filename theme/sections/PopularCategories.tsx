'use client';

import Link from 'next/link';
import Image from 'next/image';

export type PopularCategory = {
  id: string;
  title: string;
  href: string;
};

export type CategoryPopularImage = {
  productId: string;
  imageUrl: string;
  rotationIndex: number;
  cacheUntil: number;
  productsCount: number;
};

type Props = {
  items: PopularCategory[];
  popularImages?: Record<string, CategoryPopularImage>;
};

const PLACEHOLDER = (
  <div className="pointer-events-none relative mt-5 flex w-[110px] md:w-[130px] aspect-square items-center justify-center rounded-[0.375rem] bg-[#eceaf9] text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d3d0ed] md:mt-8">
    изображение
  </div>
);

const getProductsWord = (count: number) => {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'товаров';
  if (mod10 === 1) return 'товар';
  if (mod10 >= 2 && mod10 <= 4) return 'товара';
  return 'товаров';
};

export default function PopularCategories({items, popularImages}: Props) {
  if (!items.length) return null;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-gray-900 md:text-[26px]">Популярные категории</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => {
          const popularImage = popularImages?.[item.id];
          const hasImage = popularImage?.imageUrl;

          return (
            <article
              key={item.id}
              className="group relative flex h-full min-h-[170px] flex-col justify-between rounded-[0.375rem] bg-[#f2f1ff] px-5 py-5 text-gray-900 md:min-h-[190px] md:px-6 md:py-6"
            >
              <header className="flex flex-col gap-1.5">
                <h3 className="text-lg font-semibold md:text-lg">{item.title}</h3>
                {popularImage?.productsCount && (
                  <p className="text-xs font-medium text-gray-500">
                    {new Intl.NumberFormat('ru-RU').format(popularImage.productsCount)} {getProductsWord(popularImage.productsCount)}
                  </p>
                )}
              </header>

              {hasImage ? (
                <div className="pointer-events-none relative mt-5 w-[110px] md:w-[130px] aspect-square overflow-hidden rounded-[0.375rem] bg-white md:mt-8">
                  <Image
                    src={popularImage.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 110px, 130px"
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                PLACEHOLDER
              )}

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
          );
        })}
      </div>
    </section>
  );
}
