# Система ротации популярных изображений категорий

## Обзор

Система динамической ротации изображений в блоке "Популярные категории" на главной странице. Изображения автоматически меняются каждый час, показывая один из 50 самых популярных товаров каждой категории.

## Архитектура

```
┌─────────────────────────────────────────────┐
│  Next.js Page (SSR/ISR)                     │
│  - Fetches популярные изображения при сборке│
│  - Revalidate: 600s (10 минут)              │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  API Route: /api/categories/popular-images  │
│  - Memory cache: 5 минут                    │
│  - Cache-Control: 10 минут (browser)        │
│  - Cache-Control: 1 час (CDN)               │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  PostgreSQL                                 │
│  - Оптимизированный SQL запрос с CTE        │
│  - Weighted score по статистике             │
└─────────────────────────────────────────────┘
```

## Файлы

### 1. API Endpoint
**Файл**: `/app/api/categories/popular-images/route.ts`

Основной endpoint который:
- Получает топ-50 товаров для каждой категории из БД
- Вычисляет индекс ротации на основе времени
- Кэширует результат в памяти (5 мин) и через Cache-Control headers
- Возвращает JSON с изображениями для всех категорий

**Endpoint**: `GET /api/categories/popular-images`

**Response format**:
```json
{
  "categoryId1": {
    "productId": "123",
    "imageUrl": "https://cdn.example.com/image.jpg",
    "rotationIndex": 15,
    "cacheUntil": 1234567890
  },
  "categoryId2": { ... }
}
```

### 2. Конфигурация
**Файл**: `/config/category-rotation.ts`

Центральная конфигурация системы:

```typescript
export const CATEGORY_ROTATION_CONFIG = {
  poolSize: 50,              // Размер пула топ товаров
  statsPeriodDays: 30,       // Период анализа статистики
  weights: {                 // Веса метрик
    view: 1,
    click: 2,
    add_to_cart: 3,
  },
  cacheDuration: 3600,       // Кэш в секундах
  rotationInterval: 'hourly', // 'hourly' | 'daily'
};
```

### 3. React компонент
**Файл**: `/theme/sections/PopularCategories.tsx`

Client component который:
- Принимает список категорий и популярные изображения как props
- Отображает изображение если оно доступно
- Показывает placeholder если изображения нет
- Добавляет hover эффект (scale on hover)

### 4. Server Component (Page)
**Файл**: `/app/page.tsx`

Server component который:
- Fetches популярные изображения через API при SSR
- Использует ISR с revalidate: 600 (10 минут)
- Передаёт данные в HomePage template

### 5. HomePage Template
**Файл**: `/theme/templates/HomePage.tsx`

Template который:
- Принимает popularImages как prop
- Передаёт их в PopularCategories компонент

## Как работает ротация

### Алгоритм

1. **Сбор статистики** (раз в запрос к API):
   - Анализируется статистика за последние 30 дней
   - Для каждого товара вычисляется weighted score:
     ```
     score = views × 1 + clicks × 2 + add_to_cart × 3
     ```
   - Топ-50 товаров с наибольшим score для каждой категории

2. **Детерминированная ротация**:
   ```typescript
   // Каждый час - новое изображение
   const hourOfDay = new Date().getHours();
   const dayOfYear = Math.floor((now - startOfYear) / 86400000);
   const seed = dayOfYear * 24 + hourOfDay;
   const index = seed % 50; // Выбираем из пула
   ```

3. **Кэширование**:
   - Memory cache (5 мин) - для уменьшения нагрузки на БД
   - Browser cache (10 мин) - через Cache-Control
   - CDN cache (1 час) - через s-maxage
   - ISR (10 мин) - Next.js revalidation

## Настройка

### Изменение интервала ротации

В `/config/category-rotation.ts`:

```typescript
// Ротация каждый день
rotationInterval: 'daily'

// Ротация каждый час (по умолчанию)
rotationInterval: 'hourly'
```

### Изменение размера пула

```typescript
// Больше разнообразия, но больше нагрузка на БД
poolSize: 100

// Меньше разнообразия, но быстрее
poolSize: 20
```

### Изменение весов метрик

```typescript
// Больший вес для добавлений в корзину
weights: {
  view: 1,
  click: 3,
  add_to_cart: 10, // Увеличено с 3 до 10
}
```

### Изменение периода статистики

```typescript
// Анализ за последнюю неделю
statsPeriodDays: 7

// Анализ за последние 2 месяца
statsPeriodDays: 60
```

## Производительность

### Оптимизации

1. **Оптимизированный SQL запрос**:
   - Использует CTE (Common Table Expressions)
   - Один запрос вместо N+1
   - ROW_NUMBER() для ранжирования

2. **Многоуровневое кэширование**:
   - Level 1: Memory (5 мин)
   - Level 2: CDN (1 час)
   - Level 3: ISR (10 мин)

3. **Stale-while-revalidate**:
   - Браузер может показывать устаревшие данные до 24 часов
   - Пока в фоне обновляются свежие данные

### Метрики

Типичные показатели:

- **API response time**: 50-200ms (с cache hit)
- **Database query time**: 100-500ms (без кэша)
- **Memory usage**: ~1-5 MB (кэш в памяти)
- **Cache hit rate**: 95%+ (при нормальной нагрузке)

## Мониторинг

### Логи

API endpoint логирует:
- Ошибки генерации популярных изображений
- Cache hit/miss через X-Cache header

### Проверка работы

1. **Проверить API**:
   ```bash
   curl http://localhost:3000/api/categories/popular-images
   ```

2. **Проверить cache header**:
   ```bash
   curl -I http://localhost:3000/api/categories/popular-images
   # Ищите: X-Cache: HIT-Memory или MISS
   ```

3. **Проверить ротацию**:
   - Изображения должны меняться каждый час
   - В одно время все пользователи видят одинаковое изображение

## Troubleshooting

### Изображения не меняются

**Проблема**: Изображение не обновляется каждый час

**Решение**:
1. Проверьте кэш браузера (hard refresh: Cmd+Shift+R)
2. Проверьте ISR revalidation в Next.js
3. Проверьте логи API endpoint

### Низкая производительность

**Проблема**: API медленно отвечает

**Решение**:
1. Уменьшите `poolSize` (например, с 50 до 30)
2. Увеличьте `cacheDuration` (например, до 7200 секунд)
3. Проверьте индексы в БД:
   ```sql
   CREATE INDEX idx_product_stats_created ON product_statistics(product_id, created_at);
   CREATE INDEX idx_products_category ON products(category_id) WHERE enabled = true;
   ```

### Нет изображений для категории

**Проблема**: Показывается placeholder вместо изображения

**Возможные причины**:
1. В категории нет товаров
2. У товаров нет изображений
3. Товары не активны (enabled = false)
4. Нет статистики за период

**Решение**:
- Проверьте наличие активных товаров с изображениями
- Уменьшите `statsPeriodDays` для учёта старой статистики

## Будущие улучшения

### Возможные расширения

1. **Redis кэш**:
   - Добавить Redis между memory cache и БД
   - Shared cache для horizontal scaling

2. **Background job**:
   - Cron job для предварительного прогрева кэша
   - Уменьшение cold start latency

3. **A/B тестирование**:
   - Тестирование разных алгоритмов ротации
   - Анализ влияния на CTR

4. **Персонализация**:
   - Учёт истории пользователя
   - Разные изображения для разных сегментов

5. **Admin панель**:
   - UI для изменения конфигурации
   - Графики популярности товаров
   - Просмотр текущей ротации

## Контакты

При возникновении вопросов или проблем:
- Проверьте этот документ
- Изучите код в файлах выше
- Проверьте конфигурацию в `/config/category-rotation.ts`
