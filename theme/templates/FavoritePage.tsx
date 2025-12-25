'use client';

import Link from "next/link";
import Image from "next/image";
import {MouseEvent, useMemo} from "react";
import {AiOutlineClose} from "react-icons/ai";
import {useFavorites} from "@/theme/hooks/useFavorites";
import HeardIcon from "@/theme/assets/HeardIcon";

type FavoriteViewModel = {
  id: string;
  title: string;
  brand: string | null;
  finalPriceValue: number;
  priceValue?: number;
  image: string | null;
  productUrl: string;
};

const getFavoritesWord = (count: number) => {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'товаров';
  if (mod10 === 1) return 'товар';
  if (mod10 >= 2 && mod10 <= 4) return 'товара';
  return 'товаров';
};

const toNumberOrUndefined = (raw: string | null) => {
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default function FavoritePage() {
  const {favorites, removeFavorite, ready} = useFavorites();

  const preparedFavorites = useMemo<FavoriteViewModel[]>(() => {
    return favorites.reduce<FavoriteViewModel[]>((acc, item) => {
      const finalPriceValue = Number(item.finalPrice);
      if (!Number.isFinite(finalPriceValue)) return acc;
      const priceValue = toNumberOrUndefined(item.price);
      acc.push({
        id: item.id,
        title: item.title,
        brand: item.brand,
        finalPriceValue,
        priceValue,
        image: item.image,
        productUrl: item.productUrl,
      });
      return acc;
    }, []);
  }, [favorites]);

  const hasFavorites = preparedFavorites.length > 0;
  const summaryText = hasFavorites ? `${preparedFavorites.length} ${getFavoritesWord(preparedFavorites.length)}` : '';

  const handleRemoveFavorite = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault();
    event.stopPropagation();
    removeFavorite(id);
  };

  return (
    <main className='px-4 pt-6 pb-12 sm:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-6xl flex-col gap-5 sm:gap-6 lg:gap-8'>
        <header className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-3xl font-semibold text-gray-900 sm:text-4xl'>Избранное</h1>
            <p className='text-sm text-gray-600 sm:text-base'>
              Сохраняйте товары, которые хотите рассмотреть позже или заказать отдельно.
            </p>
          </div>
          {hasFavorites && (
            <span className='text-sm font-semibold uppercase tracking-wide text-purple-600 sm:text-xs'>
              {summaryText}
            </span>
          )}
        </header>

        {!ready ? (
          <div className='flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-sm font-medium text-gray-500'>
            Загружаем ваши избранные товары...
          </div>
        ) : !hasFavorites ? (
          <div className='flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center'>
            <HeardIcon width={40} height={40} color='#d4d4d8'/>
            <div className='flex flex-col gap-1 text-sm text-gray-600'>
              <span className='font-semibold text-gray-800'>В избранном пока пусто</span>
              <span>Добавляйте понравившиеся товары, чтобы вернуться к ним позже.</span>
            </div>
            <Link
              href='/'
              className='rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-700'
            >
              Смотреть каталог
            </Link>
          </div>
          ) : (
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {preparedFavorites.map((item) => {
                const hasDiscount = item.priceValue !== undefined && item.priceValue > item.finalPriceValue;
                const discountPercent = hasDiscount
                ? Math.round((1 - item.finalPriceValue / (item.priceValue ?? item.finalPriceValue)) * 100)
                : 0;

                  return (
                    <div key={item.id} className='relative'>
                      <div className='flex flex-col gap-2 p-2'>
                        <div className='relative'>
                          <Link href={item.productUrl}>
                            <div className='relative aspect-square overflow-hidden rounded-[0.375rem] border border-gray-200/60 bg-white'>
                              {item.image ? (
                                <Image
                                  fill
                                  className='h-full w-full object-cover'
                                  sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 280px'
                                  src={item.image}
                                  alt={item.title}
                                />
                              ) : (
                                <div className='flex h-full w-full items-center justify-center text-xs font-medium text-gray-400'>
                                  Нет фото
                                </div>
                              )}
                            </div>
                          </Link>
                          <div className='absolute right-2 top-2 flex flex-col items-end gap-2'>
                            {hasDiscount && discountPercent > 0 && (
                              <span className='inline-flex items-center rounded-[0.375rem] bg-purple-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm'>
                                -{discountPercent}%
                              </span>
                            )}
                            <button
                              type='button'
                              onClick={(event) => handleRemoveFavorite(event, item.id)}
                              aria-label='Убрать из избранного'
                              className='group relative flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm transition hover:bg-white hover:shadow'
                            >
                              <HeardIcon
                                width={20}
                                height={20}
                                color='#e11d48'
                                filled
                                className='transition-opacity duration-150 group-hover:opacity-0'
                              />
                              <span className='pointer-events-none absolute inset-0 flex items-center justify-center text-rose-500 opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
                                <AiOutlineClose className='h-4 w-4'/>
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                          <div>
                            <h3 className='text-sm font-medium text-gray-900'>
                              <Link className='block truncate transition hover:text-purple-600' href={item.productUrl}>
                                {item.title}
                              </Link>
                            </h3>
                            {item.brand && (
                              <p className='truncate text-xs text-gray-500'>{item.brand}</p>
                            )}
                          </div>
                          <div className='flex items-baseline gap-2'>
                            <span className='text-base font-semibold text-purple-500'>{item.finalPriceValue} BYN</span>
                            {hasDiscount && (
                              <span className='text-xs text-gray-400 line-through'>
                                {item.priceValue}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
      </div>
    </main>
  );
}
