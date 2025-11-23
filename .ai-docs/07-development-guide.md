# Руководство разработчика

[← Назад к оглавлению](./README.md)

## Типичные задачи

### Добавление нового поля в Product

1. **НЕ** редактируйте `prisma/schema.prisma` напрямую
2. Добавьте поле в Laravel миграцию (`api/database/migrations/`)
3. Запустите миграцию: `cd api && make migrate`
4. Обновите Prisma схему в `store/prisma/schema.prisma`
5. Регенерируйте клиент: `npm run db:generate`

### Создание новой страницы

```typescript
// 1. Создайте app/my-page/page.tsx
import MyPageTemplate from "@/theme/templates/MyPageTemplate";
import {getData} from "@/services/MyService";

export default async function Page() {
  const data = await getData();
  return <MyPageTemplate data={serializeObject(data)} />
}

// 2. Создайте theme/templates/MyPageTemplate.tsx
export default function MyPageTemplate({data}) {
  return <div>{data.title}</div>
}

// 3. Добавьте Server Action в services/MyService.ts
'use server'
import db from "@/prisma/db.client";

export async function getData() {
  return db.myModel.findMany();
}
```

### Работа с формами

```typescript
'use client'
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {createOrder} from '@/services/Orders';

const schema = yup.object({
  email: yup.string().email().required(),
  name: yup.string().required(),
  phone: yup.string().required(),
});

export default function OrderForm() {
  const {register, handleSubmit, formState: {errors}} = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    await createOrder({
      data: {
        name: `#${Date.now()}`,
        customer_id: BigInt(1),
        brand_id: BigInt(1),
        // ...
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Добавление фильтра

```typescript
// 1. Обновите тип Filter в services/Products.ts
type Filter = {
  categoryHandles?: string[]
  collectionHandles?: string[]
  options?: {optionId: number, values: string[]}[]
  priceRange?: {min: number, max: number} // НОВОЕ
  sort?: ProductSort
  limit?: number
  page?: number
}

// 2. Добавьте логику в getFilteredProducts()
const where: Prisma.productsWhereInput = {
  enabled: true,
  // ... существующие фильтры
  ...(filter.priceRange ? {
    final_price: {
      gte: filter.priceRange.min,
      lte: filter.priceRange.max
    }
  } : {})
};

// 3. Обновите компонент Filter
<DoubleSlider
  min={0}
  max={10000}
  value={priceRange}
  onChange={(range) => setPriceRange(range)}
/>
```

### Отслеживание просмотров товара

```typescript
// app/products/[id]/page.tsx
import {createView} from "@/services/ProductStatistics";

export default async function ProductPage({params}) {
  // Зарегистрировать просмотр
  await createView(BigInt(params.id));

  const product = await findFirst({where: {id: params.id}});
  // ...
}
```

## Performance Optimization

### Параллельные запросы

```typescript
// ❌ Медленно (последовательно)
const products = await getProducts();
const categories = await getCategories();
const settings = await getSettings();

// ✅ Быстро (параллельно)
const [products, categories, settings] = await Promise.all([
  getProducts(),
  getCategories(),
  getSettings()
]);
```

### Image Optimization

```typescript
import Image from 'next/image';

// ✅ Автоматическая оптимизация
<Image
  src={image.src}
  width={500}
  height={500}
  alt={image.alt}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>
```

### Infinite Scroll

```typescript
'use client'
import InfiniteScroll from 'react-infinite-scroll-component';
import {useState} from 'react';

export default function ProductList({initialProducts}) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMore = async () => {
    const {items} = await getFilteredProducts({
      page: page + 1,
      limit: 20
    });

    setProducts([...products, ...items]);
    setPage(page + 1);
    setHasMore(items.length > 0);
  };

  return (
    <InfiniteScroll
      dataLength={products.length}
      next={fetchMore}
      hasMore={hasMore}
      loader={<Spinner />}
    >
      {products.map(product => (
        <ProductCart key={product.id} product={product} />
      ))}
    </InfiniteScroll>
  );
}
```

## Styling Guidelines

### Tailwind utility-first

```tsx
// ✅ Предпочитайте Tailwind
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">

// ❌ Избегайте inline styles
<div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
```

### Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### SCSS для сложных стилей

```scss
// styles/components/ProductCard.module.scss
.card {
  @apply rounded-lg shadow-md;

  &:hover {
    @apply shadow-xl;
    transform: translateY(-2px);
  }
}
```

## Security Best Practices

### Server Actions Security

```typescript
'use server'
import {z} from 'zod';

const orderSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1)
  }))
});

export async function createOrder(data: unknown) {
  // ✅ Валидация
  const validated = orderSchema.parse(data);

  // ✅ Безопасная операция
  return db.orders.create({data: validated});
}
```

### XSS Protection

```typescript
// ❌ Опасно
<div dangerouslySetInnerHTML={{__html: userContent}} />

// ✅ Безопасно
<div>{userContent}</div>
```

### Environment Variables

```typescript
// ✅ Server-side only
const secret = process.env.SECRET_KEY;

// ✅ Client-side (нужен NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ НЕ коммитьте .env файлы
```

## Troubleshooting

### Prisma Client не генерируется

```bash
rm -rf node_modules/.prisma
npm run db:generate
```

### Ошибка "BigInt cannot be serialized"

```typescript
// ❌ Ошибка
<ClientComponent data={serverData} />

// ✅ Правильно
import {serializeObject} from "@/services/utilits";
<ClientComponent data={serializeObject(serverData)} />
```

### Изображения не загружаются

1. Проверьте `AWS_IMAGE_DOMAIN` в `.env`
2. Проверьте `next.config.mjs` remotePatterns
3. Убедитесь что путь не содержит ведущий слэш

### Dev server не запускается

```bash
# Проверьте порт
lsof -ti:3010 | xargs kill -9

# Очистите .next
rm -rf .next

# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

```bash
# Перезапустите TypeScript сервер в IDE
# VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"

# Регенерируйте Prisma types
npm run db:generate
```

## Code Style

### Именование

- Components: `PascalCase` (`ProductCard.tsx`)
- Services: `PascalCase` (`Products.ts`)
- Hooks: `camelCase` with `use` prefix (`useBodyScrollLock.ts`)
- Types: `PascalCase` (`ProductModel`)
- Constants: `UPPER_SNAKE_CASE` (`AWS_IMAGE_DOMAIN`)

### Imports Order

```typescript
// 1. React
import {useState} from 'react';

// 2. Next.js
import Image from 'next/image';

// 3. Third-party
import {motion} from 'framer-motion';

// 4. Services
import {findFirst} from '@/services/Products';

// 5. Components
import ProductCard from '@/theme/snippents/ProductCard';

// 6. Types
import type {ProductModel} from '@/types';
```

### File Organization

```
feature/
├── page.tsx              # Server Component (route)
├── loading.tsx           # Loading state
├── error.tsx             # Error boundary
└── components/           # Feature-specific components
    ├── FeatureClient.tsx # Client Component
    └── FeatureServer.tsx # Server Component
```

## Best Practices

### 1. Server Components First

Используйте Server Components по умолчанию. Client Components только когда нужны hooks или event handlers.

### 2. Параллельные запросы

```typescript
const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);
```

### 3. serializeObject для Client Components

```typescript
<ClientComponent data={serializeObject(serverData)} />
```

### 4. Include только необходимое

```typescript
// ❌ Избыточно
include: {Brand: true, Category: true, Variants: true, Images: true}

// ✅ Только нужное
include: {
  Brand: {select: {id: true, name: true}},
  Images: {include: {Image: true}}
}
```

### 5. Используйте TypeScript

```typescript
// ✅ Типизированные props
type Props = {
  product: ProductModel
  onSelect: (variant: VariantModel) => void
}

export default function Component({product, onSelect}: Props) {
  // ...
}
```

## Следующие шаги

- [TypeScript Types →](./08-types.md)

[← Назад к оглавлению](./README.md)