import Link from 'next/link';
import Image from 'next/image';
import {POPULAR_CATEGORIES_CONFIG} from '@/config/category-rotation';
import type {PopularCategoryCard} from '@/types/popular-categories';

type Props = {
  items: PopularCategoryCard[];
};

const getProductsWord = (count: number) => {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'товаров';
  if (mod10 === 1) return 'товар';
  if (mod10 >= 2 && mod10 <= 4) return 'товара';
  return 'товаров';
};

export default function PopularCategories({items}: Props) {
  if (!items.length) return null;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-gray-900 md:text-[26px]">Популярные категории</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => {
          const imageSlots = Array.from(
            {length: POPULAR_CATEGORIES_CONFIG.imagesPerCategory},
            (_, index) => item.images[index] ?? null,
          );

          return (
            <article
              key={item.id}
              className="relative flex h-full min-h-[170px] flex-col justify-between rounded-[0.375rem] bg-[#f2f1ff] px-5 py-5 text-gray-900 md:min-h-[190px] md:px-6 md:py-6"
            >
              <header className="flex flex-col gap-1.5">
                <h3 className="text-lg font-semibold md:text-lg">{item.title}</h3>
                {item.productsCount > 0 && (
                  <p className="text-xs font-medium text-gray-500">
                    {new Intl.NumberFormat('ru-RU').format(item.productsCount)} {getProductsWord(item.productsCount)}
                  </p>
                )}
              </header>

              <div
                className="mt-5 grid w-[165px] grid-cols-3 gap-1.5 md:mt-8 md:w-[195px]"
                aria-label={`Примеры товаров в категории ${item.title}`}
              >
                {imageSlots.map((image, index) => (
                  image ? (
                    <div
                      key={image.productId}
                      className="pointer-events-none relative aspect-square overflow-hidden rounded-[0.25rem] bg-white"
                    >
                      <Image
                        src={image.imageUrl}
                        alt={`Пример товара ${index + 1} из категории ${item.title}`}
                        fill
                        sizes="(max-width: 768px) 55px, 65px"
                        className="object-cover object-center"
                      />
                    </div>
                  ) : (
                    <div
                      key={`placeholder-${index}`}
                      aria-hidden="true"
                      className="pointer-events-none aspect-square rounded-[0.25rem] bg-[#eceaf9]"
                    />
                  )
                ))}
              </div>

              <footer className="pt-4">
                <Link
                  href={item.href}
                  aria-label={`Смотреть все товары в категории ${item.title}`}
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
