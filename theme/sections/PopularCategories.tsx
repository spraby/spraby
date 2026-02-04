'use client';

import Link from 'next/link';
import Image from 'next/image';
import {IMAGES_PER_CATEGORY} from '@/config/category-rotation';

export type PopularCategory = {
  id: string;
  title: string;
  href: string;
};

export type CategoryPopularImage = {
  images: Array<{
    productId: string;
    imageUrl: string;
  }>;
  productsCount: number;
  cacheUntil: number;
};

type Props = {
  items: PopularCategory[];
  popularImages?: Record<string, CategoryPopularImage>;
};

const PLACEHOLDER = (
  <div className="mt-5 grid grid-cols-3 gap-1.5 w-[165px] md:w-[195px] md:mt-8" aria-hidden="true">
    {Array.from({ length: IMAGES_PER_CATEGORY }).map((_, i) => (
      <div
        key={i}
        className="aspect-square rounded-[0.25rem] bg-[#eceaf9] pointer-events-none animate-pulse"
      />
    ))}
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
          const hasImages = popularImage?.images && popularImage.images.length > 0;

          return (
            <article
              key={item.id}
              className="relative flex h-full min-h-[170px] flex-col justify-between rounded-[0.375rem] bg-[#f2f1ff] px-5 py-5 text-gray-900 md:min-h-[190px] md:px-6 md:py-6"
            >
              <header className="flex flex-col gap-1.5">
                <h3 className="text-lg font-semibold md:text-lg">{item.title}</h3>
                {popularImage?.productsCount && (
                  <p className="text-xs font-medium text-gray-500" role="text" aria-label={`${popularImage.productsCount} ${getProductsWord(popularImage.productsCount)} в этой категории`}>
                    {new Intl.NumberFormat('ru-RU').format(popularImage.productsCount)} {getProductsWord(popularImage.productsCount)}
                  </p>
                )}
              </header>

              {hasImages ? (
                <div className="mt-5 grid grid-cols-3 gap-1.5 w-[165px] md:w-[195px] md:mt-8" role="group" aria-label={`Примеры товаров в категории ${item.title}`}>
                  {popularImage.images.slice(0, IMAGES_PER_CATEGORY).map((img, idx) => (
                    <div
                      key={img.productId}
                      className="pointer-events-none relative aspect-square overflow-hidden rounded-[0.25rem] bg-white"
                    >
                      <Image
                        src={img.imageUrl}
                        alt={`Пример товара ${idx + 1} из категории ${item.title}`}
                        width={65}
                        height={65}
                        sizes="(max-width: 768px) 55px, 65px"
                        className="object-cover object-center"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                PLACEHOLDER
              )}

              <footer className="pt-4">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#7c3aed] transition-colors duration-200 hover:text-[#6d31da] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 rounded"
                  aria-label={`Смотреть все товары в категории ${item.title}`}
                >
                  Смотреть
                  <span aria-hidden="true" className="text-base">›</span>
                </Link>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
