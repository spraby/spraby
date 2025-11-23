# Services Layer (Server Actions)

[← Назад к оглавлению](./README.md)

## Обзор

Все операции с базой данных инкапсулированы в **Server Actions** в директории `services/`. Каждый service файл начинается с директивы `'use server'`.

## Паттерн Server Action

```typescript
'use server'
import db from "@/prisma/db.client";
import Prisma from "@/prisma/types";

export async function findFirst(params?: Prisma.productsFindFirstArgs) {
  return db.products.findFirst(params)
}
```

**Особенности**:
- Выполняются на сервере
- Прямой доступ к БД
- Типобезопасность через Prisma
- Автоматическая сериализация результатов

## Products Service

**Файл**: `services/Products.ts`

### findFirst(params?)

Поиск одного товара:

```typescript
const product = await findFirst({
  where: {id: 123n},
  include: {
    Brand: true,
    Category: true,
    Variants: true,
    Images: {include: {Image: true}}
  }
});
```

### findMany(params?)

Поиск нескольких товаров:

```typescript
const products = await findMany({
  where: {enabled: true},
  orderBy: {created_at: 'desc'},
  take: 10
});
```

### getPage(params, conditions?)

Постраничная выборка с поиском:

```typescript
const result = await getPage(
  {limit: 20, page: 1, search: 'laptop'},
  {where: {enabled: true}}
);

// Возвращает:
{
  items: Product[],
  paginator: {
    pageSize: 20,
    current: 1,
    total: 150,
    pages: 8
  }
}
```

### getProductsOnTrend()

Получить топ товары по просмотрам (до 14):

```typescript
const trendingProducts = await getProductsOnTrend();
```

**Логика**:
1. Подсчитывает ProductStatistics с type='view'
2. Сортирует по количеству просмотров
3. Берет топ 32, затем фильтрует до 14 enabled товаров
4. Если меньше 14 - дополняет новыми товарами
5. Формирует полные URL изображений

### getLatestProducts(limit = 15)

Последние добавленные товары:

```typescript
const latestProducts = await getLatestProducts(20);
```

### getFilteredProducts(filter: Filter)

Сложная фильтрация:

```typescript
type Filter = {
  categoryHandles?: string[]
  collectionHandles?: string[]
  options?: {optionId: number, values: string[]}[]
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
  limit?: number
  page?: number
}

const result = await getFilteredProducts({
  categoryHandles: ['electronics'],
  options: [
    {optionId: 1, values: ['Красный', 'Синий']},
    {optionId: 2, values: ['XL']}
  ],
  sort: 'price_asc',
  page: 1,
  limit: 20
});

// Возвращает:
{
  items: Product[],
  total: number,
  page: number,
  pageSize: number
}
```

**Фильтрация**:
- По категориям (handle)
- По коллекциям (handle)
- По опциям (AND логика - товар должен иметь все указанные опции)
- Сортировка (newest, oldest, price_asc, price_desc)

**Автоматические преобразования**:
- `Decimal` → `string` для price/final_price
- Формирование полных URL изображений
- Include всех необходимых связей

## Categories Service

**Файл**: `services/Categories.ts`

```typescript
export async function findFirst(params?)
export async function findMany(params?)

export async function findByHandle(handle: string) {
  return db.categories.findUnique({
    where: {handle},
    include: {
      CategoryOption: {
        include: {Option: {include: {Values: true}}}
      }
    }
  });
}
```

## Collections Service

**Файл**: `services/Collections.ts`

```typescript
export async function findFirst(params?)
export async function findMany(params?)

export async function findByHandle(handle: string) {
  return db.collections.findUnique({
    where: {handle},
    include: {CategoryCollection: true}
  });
}
```

## Brands Service

**Файл**: `services/Brands.ts`

```typescript
export async function findFirst(params?)
export async function findMany(params?)
```

## Options Service

**Файл**: `services/Options.ts`

```typescript
export async function findFirst(params?)
export async function findMany(params?)
export async function findWithValues(optionId: bigint)
```

## Variants Service

**Файл**: `services/Variants.ts`

```typescript
export async function findFirst(params?)
export async function findMany(params?)
```

## Orders Service

**Файл**: `services/Orders.ts`

```typescript
export async function create(params: Prisma.ordersCreateArgs) {
  return db.orders.create(params);
}
```

**Пример создания заказа**:

```typescript
const order = await create({
  data: {
    name: '#12345',
    customer_id: customerId,
    brand_id: brandId,
    status: 'pending',
    delivery_status: 'pending',
    financial_status: 'unpaid',
    OrderItems: {
      create: [
        {
          product_id: productId,
          variant_id: variantId,
          title: 'Product Title',
          quantity: 2,
          price: 99.99
        }
      ]
    },
    OrderShippings: {
      create: {
        address: '123 Main St',
        city: 'City',
        zip: '12345',
        country: 'Country'
      }
    }
  }
});
```

## Users Service

**Файл**: `services/Users.ts`

```typescript
export async function findFirst(params?)
export async function findMany(params?)
export async function findByEmail(email: string)
```

## Settings Service

**Файл**: `services/Settings.ts`

### getMainMenu()

```typescript
const menu = await getMainMenu();
// Возвращает MenuItem[] из settings с key='main_menu'
```

### getBreadcrumbs(path: string)

```typescript
const breadcrumbs = await getBreadcrumbs('/categories/electronics');
// Возвращает BreadcrumbItem[]
```

### getInformationSettings()

```typescript
const info = await getInformationSettings();
// Возвращает контактную информацию, социальные сети и т.д.
```

## ProductStatistics Service

**Файл**: `services/ProductStatistics.ts`

### createView(productId: bigint)

Зарегистрировать просмотр товара:

```typescript
await createView(BigInt(productId));
```

**Использование**:
```typescript
// В Server Component страницы товара
export default async function ProductPage({params}) {
  await createView(BigInt(params.id));
  // ...
}
```

## Utilities

**Файл**: `services/utilits.ts`

### serializeObject(obj)

Сериализует объект для передачи из Server Component в Client Component:

```typescript
import {serializeObject} from "@/services/utilits";

// В Server Component
const product = await findFirst({where: {id: 1n}});

// BigInt ID не сериализуются напрямую в JSON
return <ClientComponent product={serializeObject(product)} />
```

**Что делает**:
- Конвертирует BigInt в string
- Конвертирует Date в ISO string
- Рекурсивно обрабатывает вложенные объекты и массивы

## Общие паттерны

### Include связей

```typescript
const product = await findFirst({
  where: {id: 1n},
  include: {
    Brand: {
      include: {User: true, Settings: true}
    },
    Category: {
      include: {CategoryOption: {include: {Option: true}}}
    },
    Variants: {
      where: {enabled: true},
      include: {VariantValue: {include: {Value: true}}}
    },
    Images: {
      include: {Image: true},
      orderBy: {position: 'asc'}
    }
  }
});
```

### Формирование URL изображений

Все Services автоматически добавляют полный URL:

```typescript
Images: product.Images?.map(i => ({
  ...i,
  Image: {
    ...i.Image,
    src: `${process.env.AWS_IMAGE_DOMAIN}/${i.Image?.src}`
  }
}))
```

### Конвертация Decimal

```typescript
const mappedProducts = products.map(product => ({
  ...product,
  price: `${product.price}`,
  final_price: `${product.final_price}`,
  Variants: product.Variants?.map(v => ({
    ...v,
    price: `${v.price}`,
    final_price: `${v.final_price}`
  }))
}));
```

## Best Practices

### 1. Всегда используйте Server Actions

```typescript
// ❌ НЕ импортируйте Prisma напрямую в компонентах
import db from "@/prisma/db.client";

// ✅ Используйте Services
import {findFirst} from "@/services/Products";
```

### 2. Используйте serializeObject для Client Components

```typescript
// ❌ Ошибка сериализации
<ClientComponent data={serverData} />

// ✅ Правильно
<ClientComponent data={serializeObject(serverData)} />
```

### 3. Include только необходимые связи

```typescript
// ❌ Избыточно
include: {
  Brand: true,
  Category: true,
  Variants: true,
  Images: true,
  OrderItems: true,
  Statistics: true
}

// ✅ Только нужное
include: {
  Brand: {select: {id: true, name: true}},
  Images: {include: {Image: true}}
}
```

### 4. Используйте where для фильтрации

```typescript
include: {
  Variants: {
    where: {enabled: true},
    include: {VariantValue: true}
  }
}
```

## Следующие шаги

- [App Router и страницы →](./04-routing.md)
- [Theme Components →](./05-theme-components.md)

[← Назад к оглавлению](./README.md)