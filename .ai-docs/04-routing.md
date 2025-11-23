# App Router и страницы

[← Назад к оглавлению](./README.md)

## Структура маршрутов

Next.js 14 использует file-based routing в директории `app/`:

```
app/
├── page.tsx                      # Route: /
├── layout.tsx                    # Root layout для всех страниц
├── products/
│   └── [id]/
│       ├── page.tsx              # Route: /products/:id
│       └── loading.tsx           # Loading UI
├── categories/
│   └── [handle]/
│       ├── page.tsx              # Route: /categories/:handle
│       └── loading.tsx
├── collections/
│   └── [handle]/
│       ├── page.tsx              # Route: /collections/:handle
│       └── loading.tsx
├── purchases/
│   └── [id]/
│       ├── page.tsx              # Route: /purchases/:id
│       └── loading.tsx
└── search/
    └── page.tsx                  # Route: /search
```

## Root Layout

**Файл**: `app/layout.tsx`

```typescript
import ThemeLayout from "@/theme/layouts/ThemeLayout";
import {getMainMenu} from "@/services/Settings";

export const metadata: Metadata = {
  title: "Spraby Store",
  description: "E-commerce store",
};

export default async function RootLayout({children}) {
  const menu = await getMainMenu();

  return (
    <html lang="en">
      <body>
        <ThemeLayout menu={menu}>
          {children}
        </ThemeLayout>
      </body>
    </html>
  );
}
```

## Главная страница (/)

**Файл**: `app/page.tsx`

```typescript
import HomePage from "@/theme/templates/HomePage";
import {getLatestProducts, getProductsOnTrend} from "@/services/Products";

export default async function Page() {
  const [topProducts, latestProducts] = await Promise.all([
    getProductsOnTrend(),
    getLatestProducts(15)
  ]);

  return <HomePage topProducts={topProducts} latestProducts={latestProducts}/>
}
```

**Особенности**:
- Параллельная загрузка данных через `Promise.all()`
- Server Component (прямой доступ к БД)
- Статическая генерация по умолчанию

## Страница товара (/products/:id)

**Файл**: `app/products/[id]/page.tsx`

```typescript
import ProductPage from "@/theme/templates/ProductPage";
import {findFirst, findMany} from "@/services/Products";
import {getBreadcrumbs, getInformationSettings} from "@/services/Settings";
import {serializeObject} from "@/services/utilits";
import {createView} from "@/services/ProductStatistics";

export default async function (props: any) {
  // Зарегистрировать просмотр
  await createView(BigInt(props.params.id));

  // Загрузить товар
  const product = await findFirst({
    where: {id: props.params.id},
    include: {
      Category: {
        include: {
          CategoryOption: {
            include: {Option: {include: {Values: true}}}
          }
        }
      },
      Brand: {include: {Settings: true, User: true}},
      Variants: {
        where: {enabled: true},
        include: {
          Image: {include: {Image: true}},
          VariantValue: {include: {Value: {include: {Option: true}}}}
        }
      },
      Images: {include: {Image: true}}
    }
  });

  // Сформировать полные URL изображений
  const productData = {
    ...product,
    Images: product?.Images?.map(i => ({
      ...i,
      Image: {
        ...i.Image,
        src: process.env.AWS_IMAGE_DOMAIN + '/' + i.Image?.src
      }
    }))
  };

  // Другие товары этого бренда
  const otherProducts = product?.brand_id ? await findMany({
    where: {
      brand_id: product.brand_id,
      enabled: true,
      NOT: {id: product.id}
    },
    include: {
      Brand: {include: {User: true}},
      Images: {include: {Image: true}}
    },
    take: 12
  }) : [];

  // Breadcrumbs
  let breadcrumbs = [];
  if (productData?.Category?.handle) {
    breadcrumbs = await getBreadcrumbs(`/categories/${productData.Category.handle}`);
  }

  const informationSettings = await getInformationSettings();

  return <ProductPage
    product={serializeObject(productData)}
    otherProducts={serializeObject(otherProducts)}
    informationSettings={informationSettings}
    breadcrumbs={breadcrumbs}
  />
}
```

**Loading State**: `app/products/[id]/loading.tsx`

```typescript
export default function Loading() {
  return <ProductPageSkeleton />
}
```

## Страница категории (/categories/:handle)

**Файл**: `app/categories/[handle]/page.tsx`

```typescript
import CategoryPage from "@/theme/templates/CategoryPage";
import {findByHandle} from "@/services/Categories";
import {getFilteredProducts} from "@/services/Products";
import {serializeObject} from "@/services/utilits";

export default async function (props: any) {
  const category = await findByHandle(props.params.handle);

  const {items: products, total} = await getFilteredProducts({
    categoryHandles: [props.params.handle],
    limit: 20,
    page: 1
  });

  return <CategoryPage
    category={serializeObject(category)}
    products={serializeObject(products)}
    total={total}
  />
}
```

## Страница коллекции (/collections/:handle)

**Файл**: `app/collections/[handle]/page.tsx`

Аналогична странице категории, но использует `collectionHandles`.

## Страница поиска (/search)

**Файл**: `app/search/page.tsx`

```typescript
import SearchPage from "@/theme/templates/SearchPage";
import {getPage} from "@/services/Products";
import {serializeObject} from "@/services/utilits";

export default async function (props: any) {
  const searchParams = props.searchParams;
  const query = searchParams?.q || '';

  const {items, paginator} = await getPage(
    {limit: 20, page: 1, search: query},
    {where: {enabled: true}}
  );

  return <SearchPage
    products={serializeObject(items)}
    paginator={paginator}
    query={query}
  />
}
```

**URL**: `/search?q=laptop`

## Страница заказа (/purchases/:id)

**Файл**: `app/purchases/[id]/page.tsx`

```typescript
import PurchasePage from "@/theme/templates/PurchasePage";
import {findFirst} from "@/services/Orders";
import {serializeObject} from "@/services/utilits";

export default async function (props: any) {
  // Убираем # из имени заказа
  const orderName = `#${props.params.id}`;

  const order = await findFirst({
    where: {name: orderName},
    include: {
      Customer: true,
      OrderItems: {
        include: {
          Product: true,
          Variant: true,
          ProductImage: {include: {Image: true}}
        }
      },
      OrderShippings: true
    }
  });

  return <PurchasePage order={serializeObject(order)} />
}
```

**URL**: `/purchases/12345` (для заказа #12345)

## Dynamic Segments

Динамические сегменты используют квадратные скобки:

- `[id]` - один параметр
- `[...slug]` - catch-all (любое количество сегментов)
- `[[...slug]]` - опциональный catch-all

**Доступ к параметрам**:

```typescript
export default async function Page(props: any) {
  const id = props.params.id;
  const handle = props.params.handle;
  const searchParams = props.searchParams; // Query string
}
```

## Search Params

**URL**: `/search?q=laptop&sort=price_asc`

```typescript
export default async function Page(props: any) {
  const query = props.searchParams?.q;
  const sort = props.searchParams?.sort;
}
```

## Loading States

Каждый роут может иметь `loading.tsx`:

```typescript
// app/products/[id]/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-96 bg-gray-200 rounded"></div>
      <div className="h-8 bg-gray-200 rounded mt-4"></div>
    </div>
  );
}
```

Отображается автоматически во время загрузки страницы.

## Error Handling

Можно добавить `error.tsx`:

```typescript
'use client'

export default function Error({error, reset}) {
  return (
    <div>
      <h2>Что-то пошло не так!</h2>
      <button onClick={() => reset()}>Попробовать снова</button>
    </div>
  );
}
```

## Metadata

Можно экспортировать metadata из page.tsx:

```typescript
import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Product Title',
  description: 'Product description',
};
```

Или динамически:

```typescript
export async function generateMetadata({params}): Promise<Metadata> {
  const product = await findFirst({where: {id: params.id}});

  return {
    title: product.title,
    description: product.description,
  };
}
```

## Revalidation

По умолчанию страницы кэшируются. Для ISR:

```typescript
export const revalidate = 120; // Revalidate every 120 seconds
```

Или для динамического рендеринга:

```typescript
export const dynamic = 'force-dynamic'; // Всегда серверный рендеринг
```

## Следующие шаги

- [Theme Components →](./05-theme-components.md)
- [Конфигурация →](./06-configuration.md)

[← Назад к оглавлению](./README.md)