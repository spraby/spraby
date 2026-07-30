import {NextResponse} from 'next/server';

import {POPULAR_CATEGORIES_CONFIG} from '@/config/category-rotation';
import {getHomePopularCategories} from '@/services/HomePopularCategories';
import type {PopularCategoryCard} from '@/types/popular-categories';

// Next.js требует статически анализируемый литерал для route segment config.
export const revalidate = 3600;

type PopularImagesResponse = Record<
  string,
  Pick<PopularCategoryCard, 'images' | 'productsCount' | 'cacheUntil'>
>;

/**
 * Обратная совместимость для внешних потребителей и диагностики.
 * Главная страница вызывает сервис напрямую и не делает HTTP-запрос к самой себе.
 */
export async function GET() {
  const categories = await getHomePopularCategories();
  const response = Object.fromEntries(
    categories.map(category => [
      category.id,
      {
        images: category.images,
        productsCount: category.productsCount,
        cacheUntil: category.cacheUntil,
      },
    ]),
  ) as PopularImagesResponse;

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': [
        'public',
        `max-age=${POPULAR_CATEGORIES_CONFIG.rotationSeconds}`,
        `s-maxage=${POPULAR_CATEGORIES_CONFIG.rotationSeconds}`,
        `stale-while-revalidate=${POPULAR_CATEGORIES_CONFIG.rotationSeconds * 6}`,
      ].join(', '),
    },
  });
}
