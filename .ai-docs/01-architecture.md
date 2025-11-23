# Архитектура и технологический стек

[← Назад к оглавлению](./README.md)

## Технологический стек

### Core Framework
- **Next.js**: 14.2.3 (App Router)
- **React**: 18.3.0
- **TypeScript**: 5
- **Node.js**: 20+

### Database & ORM
- **Prisma**: 5.20.0
- **Database**: PostgreSQL 15 (shared с Laravel API)
- **Connection**: Connection pooling через PgBouncer

### UI Components & Styling
- **NextUI**: 2.4.1 (@nextui-org/react) - современная UI библиотека
- **Ant Design**: 5.14.0 - дополнительные UI компоненты
- **TailwindCSS**: 3.3.0 - utility-first CSS
- **SASS**: 1.64.1 - препроцессор CSS
- **Emotion**: 11.11.0 (@emotion/react, @emotion/styled) - CSS-in-JS

### Forms & Validation
- **React Hook Form**: 7.53.0 - управление формами
- **Yup**: 1.4.0 - валидация схем
- **@hookform/resolvers**: 3.9.0 - интеграция RHF с Yup

### Animations
- **Framer Motion**: 11.5.4 - анимации и transitions

### Carousels & Sliders
- **@splidejs/react-splide**: 0.7.12
- **react-splide-ts**: 0.7.14

### Utilities
- **lodash**: 4.17.21 - коллекции и утилиты
- **date-fns**: 3.6.0 - работа с датами
- **transliteration**: 2.3.5 - транслитерация
- **react-device-detect**: 2.2.3 - определение устройства
- **react-infinite-scroll-component**: 6.1.0 - бесконечная прокрутка
- **bcrypt**: 5.1.1 - хэширование паролей

### Development Tools
- **ESLint** - линтер
- **PostCSS** - CSS трансформации
- **Autoprefixer** - автоматические префиксы

## Структура проекта

```
store/
├── app/                          # Next.js App Router
│   ├── categories/
│   │   └── [handle]/            # Динамический роут категории
│   │       ├── page.tsx         # Server Component
│   │       └── loading.tsx      # Loading UI
│   ├── collections/
│   │   └── [handle]/            # Динамический роут коллекции
│   │       ├── page.tsx
│   │       └── loading.tsx
│   ├── products/
│   │   └── [id]/                # Динамический роут товара
│   │       ├── page.tsx
│   │       └── loading.tsx
│   ├── purchases/
│   │   └── [id]/                # Динамический роут заказа
│   │       ├── page.tsx
│   │       └── loading.tsx
│   ├── search/                  # Страница поиска
│   │   └── page.tsx
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Главная страница (/)
│   ├── globals.css              # Глобальные стили
│   └── favicon.ico
│
├── services/                    # Server Actions для работы с БД
│   ├── Products.ts              # Операции с товарами
│   ├── Categories.ts            # Операции с категориями
│   ├── Collections.ts           # Операции с коллекциями
│   ├── Brands.ts                # Операции с брендами
│   ├── Options.ts               # Операции с опциями
│   ├── Variants.ts              # Операции с вариантами
│   ├── Orders.ts                # Операции с заказами
│   ├── Users.ts                 # Операции с пользователями
│   ├── Settings.ts              # Настройки и меню
│   ├── ProductStatistics.ts     # Статистика просмотров
│   └── utilits.ts               # Утилиты (serializeObject)
│
├── theme/                       # Переиспользуемые компоненты темы
│   ├── layouts/                 # Layout компоненты
│   │   └── ThemeLayout.tsx      # Основной layout приложения
│   ├── sections/                # Секции страниц
│   │   ├── HeroShowcase.tsx     # Hero секция
│   │   ├── LayoutHeader.tsx     # Шапка сайта
│   │   └── PopularCategories.tsx
│   ├── snippents/               # ⚠️ Опечатка: должно быть snippets
│   │   ├── ProductCart.tsx      # Карточка товара
│   │   ├── Filter.tsx           # Фильтры товаров
│   │   ├── ResponsiveFilters.tsx # Адаптивные фильтры
│   │   ├── VariantSelector.tsx  # Селектор вариантов
│   │   ├── Menu.tsx             # Меню desktop
│   │   ├── MobileMenu.tsx       # Меню mobile
│   │   ├── Drawer.tsx           # Боковая панель
│   │   ├── Price.tsx            # Отображение цены
│   │   ├── Accordion.tsx        # Аккордеон
│   │   ├── Checkbox.tsx         # Кастомный чекбокс
│   │   ├── Select.tsx           # Кастомный select
│   │   ├── Tabs.tsx             # Табы
│   │   ├── DoubleSlider.tsx     # Range slider
│   │   └── FilterPanel.tsx      # Панель фильтров
│   ├── templates/               # Шаблоны страниц
│   │   ├── HomePage.tsx         # Шаблон главной страницы
│   │   └── ProductPage.tsx      # Шаблон страницы товара
│   ├── hooks/                   # Custom React hooks
│   │   └── useBodyScrollLock.ts # Блокировка скролла
│   └── assets/                  # Статические ресурсы темы
│
├── types/                       # TypeScript типы
│   └── index.ts                 # Общие типы приложения
│
├── prisma/                      # Prisma конфигурация
│   ├── schema.prisma            # Schema определения
│   └── db.client.ts             # Prisma client instance
│
├── styles/                      # Глобальные стили
│   └── index.scss               # SCSS стили
│
├── public/                      # Публичные статические файлы
│   └── ...
│
├── .ai-docs/                    # Документация для AI
│   ├── README.md                # Главная страница документации
│   ├── 01-architecture.md       # Этот файл
│   └── ...
│
├── .env                         # Environment переменные
├── .env.dev                     # Dev environment
├── next.config.mjs              # Next.js конфигурация
├── tailwind.config.ts           # Tailwind конфигурация
├── tsconfig.json                # TypeScript конфигурация
├── postcss.config.js            # PostCSS конфигурация
├── awsImgLoader.js              # AWS Image loader
└── package.json                 # Dependencies и scripts
```

## Ключевые особенности архитектуры

### 1. Server Components First

По умолчанию все компоненты в `app/` являются **Server Components**. Это означает:

- ✅ Выполняются на сервере
- ✅ Прямой доступ к БД через Server Actions
- ✅ Не увеличивают bundle size клиента
- ✅ Лучше для SEO

Используйте `'use client'` только когда необходимо:
- React hooks (useState, useEffect и т.д.)
- Event handlers (onClick, onChange и т.д.)
- Browser APIs (window, localStorage и т.д.)
- Context API

### 2. Server Actions для работы с данными

Вместо REST API используются **Server Actions** (`'use server'`):

```typescript
// services/Products.ts
'use server'
import db from "@/prisma/db.client";

export async function findFirst(params?) {
  return db.products.findFirst(params)
}
```

**Преимущества**:
- Нет необходимости в API endpoints
- Типобезопасность end-to-end
- Автоматическая сериализация
- Меньше boilerplate кода

### 3. Shared Database с Laravel API

⚠️ **ВАЖНО**: Store приложение использует **ту же PostgreSQL базу данных**, что и Laravel API:

```
┌─────────────────┐
│  Laravel API    │ ──┐
│  (Eloquent ORM) │   │
└─────────────────┘   │
                      ├──> PostgreSQL (port 5435)
┌─────────────────┐   │
│  Next.js Store  │ ──┘
│  (Prisma ORM)   │
└─────────────────┘
```

**Последствия**:
- При изменении схемы нужно обновлять и Laravel миграции, и Prisma schema
- UUID используются как primary keys (BigInt в Prisma)
- Cascading deletes настроены на уровне БД

### 4. Прямое подключение к PostgreSQL через Prisma

```typescript
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")       // Connection pooling
  directUrl = env("POSTGRES_URL_NON_POOLING")  // Direct connection
}
```

**Connection pooling** через PgBouncer для оптимальной производительности.

### 5. AWS S3 для изображений

Все изображения товаров хранятся в **AWS S3**:

```typescript
// Путь в БД: "products/image123.jpg"
// Полный URL: "https://spraby.s3.eu-north-1.amazonaws.com/products/image123.jpg"

const fullUrl = `${process.env.AWS_IMAGE_DOMAIN}/${image.src}`;
```

### 6. File-based Routing (App Router)

Next.js 14 использует App Router с файловой маршрутизацией:

```
app/
├── page.tsx                      # Route: /
├── products/
│   └── [id]/
│       └── page.tsx              # Route: /products/:id
└── categories/
    └── [handle]/
        └── page.tsx              # Route: /categories/:handle
```

**Динамические роуты** используют квадратные скобки: `[id]`, `[handle]`

### 7. Четырехуровневая структура компонентов

Компоненты темы организованы в 4 уровня:

1. **Layouts** - обертки всего приложения
2. **Sections** - крупные секции страниц
3. **Snippets** - маленькие переиспользуемые компоненты
4. **Templates** - шаблоны целых страниц

Это обеспечивает:
- Легкую навигацию в коде
- Переиспользование компонентов
- Четкое разделение ответственности

### 8. TypeScript everywhere

Весь код написан на **TypeScript**:
- Типобезопасность
- Автокомплит в IDE
- Рефакторинг без страха
- Prisma генерирует типы автоматически

## Отличия от традиционных подходов

### Нет REST API

Традиционный подход:
```
Frontend -> HTTP Request -> Backend API -> Database
```

Наш подход:
```
Frontend (Server Component) -> Server Action -> Prisma -> Database
```

### Нет разделения на Frontend/Backend

В Next.js 14 App Router:
- **Server Components** - это backend (доступ к БД)
- **Client Components** - это frontend (интерактивность)

Все в одном проекте, одном языке (TypeScript).

### Shared Database Architecture

```
┌──────────────────────────────────────┐
│         PostgreSQL Database          │
│  (Single source of truth)            │
└──────────────────────────────────────┘
         ▲                    ▲
         │                    │
    ┌────┴────┐          ┌────┴────┐
    │ Laravel │          │ Next.js │
    │   API   │          │  Store  │
    │         │          │         │
    │ Eloquent│          │ Prisma  │
    └─────────┘          └─────────┘
```

**Преимущества**:
- Единый источник правды
- Нет необходимости в синхронизации данных
- Изменения в БД сразу видны обоим приложениям

**Недостатки**:
- Требуется координация изменений схемы
- Нужно поддерживать две ORM конфигурации

## Deployment Architecture

### Development
```
Port 3010: Next.js Dev Server
Port 5435: PostgreSQL Database (shared)
AWS S3:    Image storage
```

### Production (рекомендуемое)
```
Vercel/Railway: Next.js App
AWS RDS:        PostgreSQL Database
AWS S3:         Image storage
CloudFront:     CDN для изображений
```

## Performance Considerations

### Edge Computing
Next.js поддерживает Edge Runtime для мгновенных ответов.

### Image Optimization
Next.js Image компонент автоматически оптимизирует изображения:
- WebP/AVIF форматы
- Responsive sizes
- Lazy loading

### Caching Strategy
- Static pages: кэшируются навсегда
- Dynamic pages: ISR (Incremental Static Regeneration)
- Server Actions: можно добавить Redis для кэширования

### Database Connection Pooling
PgBouncer для оптимального использования соединений с БД.

## Следующие шаги

- [Prisma Schema и модели данных →](./02-prisma-schema.md)
- [Services Layer →](./03-services.md)
- [App Router и страницы →](./04-routing.md)

[← Назад к оглавлению](./README.md)