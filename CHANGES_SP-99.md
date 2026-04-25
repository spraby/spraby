# Изменения в ветке `mike/SP-99`

Коммит: `fix slider - variant - price on product page`

## Список изменённых файлов

### `app/products/[id]/page.tsx`
Prisma-запросы для вариантов получили `orderBy: { id: 'asc' }` вместо `take: 1`, чтобы на страницу передавались все варианты продукта. Добавлена сериализация массива `Variants` (price/final_price в строку, src изображения с доменом AWS) как для самого продукта, так и для списка похожих товаров.

### `services/Products.ts`
В сервисных функциях (`getProductsOnTrend`, `getTrendingProducts`, `getLatestProducts`, `getFilteredProducts`) убран лимит `take: 1` у вариантов, добавлена сортировка по `id asc` и сериализация `price`/`final_price` всех вариантов. В `getFilteredProducts` добавлен фильтр `where: { enabled: true }`.

### `theme/snippents/DoubleSlider.tsx`
Добавлена функция `normalizeImageSrc` для корректного сопоставления путей изображений. Подключён колбэк `onImageChange`, который срабатывает при смене слайда — теперь слайдер сообщает родительскому компоненту о текущем изображении. Поиск стартового слайда использует нормализованные URL.

### `theme/snippents/ProductCart.tsx`
Карточка товара в каталоге теперь интерактивна: при наведении на точки-индикаторы внизу фотографии переключается изображение, а вместе с ним — активный вариант, его цена и ссылка `href` (добавляется `?variantId=...`). Добавлены хелперы `toIdString` и `normalizeImageSrc`, дедупликация списка изображений, мета-строка с названием бренда и варианта.

### `theme/snippents/Tabs.tsx`
Рефакторинг хуков: `measureOverflow` обёрнут в `useCallback`, зависимости `useEffect`/`useLayoutEffect` упрощены до `[measureOverflow, activeTab]`. Убраны лишние перерендеры через сравнение предыдущего состояния перед `setState`.

### `theme/snippents/VariantSelector.tsx`
Полная переработка логики выбора варианта. Вместо связки двух `useEffect` через локальный стейт `selectedOptions` введён единый источник истины — `activeVariantId`. Добавлен новый проп `selectedVariantId` для управления компонентом извне (синхронизация с галереей). Логика разложена на чистые функции: `resolveVariant`, `findVariantByOptions`, `getEnabledValuesForOption`, `normalizeSelectedOptions`. Убран setState во время рендера.

### `theme/templates/ProductPage.tsx`
Цены (`currentPrice`, `currentFinalPrice`), скидка и кнопка «в корзину» теперь берутся из активного варианта, а не из продукта. Добавлены:
- `galleryImages` — мемоизированная дедуплицированная галерея;
- `getVariantImageSrc` — поиск изображения конкретного варианта в галерее;
- `handleImageChange` — синхронизация слайдера → варианта;
- `handleVariantChange` — синхронизация селектора → слайдера;
- начальный вариант читается из query-параметра `variantId`;
- `productTabs` вынесены в `useMemo` и переиспользуются в десктоп/мобильной версии;
- исправлены зависимости `useEffect` (`[product.id]` вместо `[]`), безопасный `sort` через копию массива.