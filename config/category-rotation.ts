/**
 * Конфигурация ротации популярных изображений категорий
 *
 * Этот файл содержит все настройки для системы динамической ротации
 * изображений в блоке "Популярные категории"
 */

type RotationInterval = 'hourly' | 'daily' | 'custom';

export const CATEGORY_ROTATION_CONFIG: {
  poolSize: number;
  statsPeriodDays: number;
  weights: { view: number; click: number; add_to_cart: number };
  cacheDuration: number;
  rotationInterval: RotationInterval;
  fallbackImage: string;
} = {
  /**
   * Размер пула топ товаров для каждой категории
   * Чем больше значение, тем больше разнообразие, но выше нагрузка на БД
   * Рекомендуемые значения: 20-100
   */
  poolSize: 50,

  /**
   * Период анализа статистики в днях
   * Определяет, за какой период учитываются просмотры, клики и добавления в корзину
   * Рекомендуемые значения: 7, 14, 30, 60
   */
  statsPeriodDays: 30,

  /**
   * Веса для расчёта популярности
   * view: просмотр товара
   * click: клик по товару
   * add_to_cart: добавление в корзину
   *
   * Чем выше вес, тем больше влияние метрики на итоговый рейтинг
   */
  weights: {
    view: 1,
    click: 2,
    add_to_cart: 3,
  },

  /**
   * Длительность кэша в секундах
   * Определяет, как часто обновляются данные
   * 3600 = 1 час, 1800 = 30 минут, 600 = 10 минут
   */
  cacheDuration: 3600, // 1 hour

  /**
   * Интервал ротации изображений
   * 'hourly' - каждый час меняется изображение
   * 'daily' - каждый день меняется изображение
   * 'custom' - можно настроить custom логику в getRotationIndex()
   */
  rotationInterval: 'hourly',

  /**
   * Fallback изображение если нет товаров в категории
   */
  fallbackImage: '/placeholder-category.jpg',
};

/**
 * Вспомогательные функции для работы с конфигурацией
 */

/**
 * Получает текущий индекс ротации на основе настроек
 */
export function getRotationIndex(poolSize: number): number {
  const now = new Date();

  if (CATEGORY_ROTATION_CONFIG.rotationInterval === 'daily') {
    // Меняется раз в день
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return dayOfYear % poolSize;
  }

  if (CATEGORY_ROTATION_CONFIG.rotationInterval === 'hourly') {
    // Меняется каждый час
    const hourOfDay = now.getHours();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const seed = dayOfYear * 24 + hourOfDay;
    return seed % poolSize;
  }

  // Custom logic
  return 0;
}

/**
 * Валидация конфигурации
 */
export function validateConfig() {
  const errors: string[] = [];

  if (CATEGORY_ROTATION_CONFIG.poolSize < 1 || CATEGORY_ROTATION_CONFIG.poolSize > 200) {
    errors.push('poolSize должен быть между 1 и 200');
  }

  if (CATEGORY_ROTATION_CONFIG.statsPeriodDays < 1 || CATEGORY_ROTATION_CONFIG.statsPeriodDays > 365) {
    errors.push('statsPeriodDays должен быть между 1 и 365');
  }

  if (CATEGORY_ROTATION_CONFIG.cacheDuration < 60 || CATEGORY_ROTATION_CONFIG.cacheDuration > 86400) {
    errors.push('cacheDuration должен быть между 60 (1 мин) и 86400 (24 часа)');
  }

  return errors;
}
