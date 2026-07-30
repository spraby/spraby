/**
 * Настройки блока «Популярные категории» на главной.
 *
 * Рейтинг меняется значительно медленнее обложек, поэтому данные из БД и
 * визуальная ротация имеют разные интервалы кеширования.
 */
export const POPULAR_CATEGORIES_CONFIG = {
  categoryLimit: 9,
  imagesPerCategory: 6,
  candidatePoolSize: 24,
  statisticsPeriodDays: 30,
  rotationSeconds: 60 * 60,
  rankingCacheSeconds: 6 * 60 * 60,
  weights: {
    view: 1,
    click: 3,
    addToCart: 5,
  },
} as const;

export const POPULAR_CATEGORIES_CACHE_TAG = 'home:popular-categories';
