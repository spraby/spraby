# Theme Components

[← Назад к оглавлению](./README.md)

## Архитектура темы

Компоненты организованы в 4 уровня иерархии:

1. **Layouts** (`theme/layouts/`) - Обертки приложения
2. **Sections** (`theme/sections/`) - Крупные секции страниц
3. **Snippets** (`theme/snippents/`) - Маленькие переиспользуемые компоненты
4. **Templates** (`theme/templates/`) - Шаблоны целых страниц

## Layouts

### ThemeLayout

**Файл**: `theme/layouts/ThemeLayout.tsx`

Основной layout всего приложения:

```typescript
import LayoutHeader from "@/theme/sections/LayoutHeader";

export default function ThemeLayout({children, menu}) {
  return (
    <>
      <LayoutHeader menu={menu} />
      <main>{children}</main>
      <footer>...</footer>
    </>
  );
}
```

## Sections

### LayoutHeader

**Файл**: `theme/sections/LayoutHeader.tsx`

Шапка сайта с навигацией:

- Логотип
- Меню
- Поиск
- Корзина (если есть)

### HeroShowcase

**Файл**: `theme/sections/HeroShowcase.tsx`

Hero секция главной страницы с баннерами.

### PopularCategories

**Файл**: `theme/sections/PopularCategories.tsx`

Секция популярных категорий.

## Snippets

### ProductCart

**Файл**: `theme/snippents/ProductCart.tsx`

Карточка товара для сеток/списков:

```typescript
<ProductCart
  id={product.id}
  title={product.title}
  price={product.price}
  finalPrice={product.final_price}
  image={product.Images?.[0]}
/>
```

### Filter

**Файл**: `theme/snippents/Filter.tsx`

Компонент фильтрации товаров.

### ResponsiveFilters

**Файл**: `theme/snippents/ResponsiveFilters.tsx`

Адаптивные фильтры (desktop sidebar + mobile drawer).

### VariantSelector

**Файл**: `theme/snippents/VariantSelector.tsx`

Селектор вариантов товара (цвет, размер):

```typescript
<VariantSelector
  options={product.Category.CategoryOption}
  variants={product.Variants}
  onSelect={(variant) => setSelectedVariant(variant)}
/>
```

### Price

**Файл**: `theme/snippents/Price.tsx`

Отображение цены с учетом скидок:

```typescript
<Price
  price={product.price}
  finalPrice={product.final_price}
/>
```

### Menu

**Файл**: `theme/snippents/Menu.tsx`

Desktop меню навигации.

### MobileMenu

**Файл**: `theme/snippents/MobileMenu.tsx`

Mobile меню с гамбургером.

### Drawer

**Файл**: `theme/snippents/Drawer.tsx`

Боковая выдвижная панель:

```typescript
<Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <div>Content</div>
</Drawer>
```

### UI Components

- **Accordion** - Аккордеон
- **Checkbox** - Кастомный чекбокс
- **Select** - Кастомный select
- **Tabs** - Табы
- **DoubleSlider** - Range slider для фильтра цен
- **FilterPanel** - Панель фильтров

## Templates

### HomePage

**Файл**: `theme/templates/HomePage.tsx`

Шаблон главной страницы:

```typescript
type Props = {
  topProducts: ProductModel[]
  latestProducts: ProductModel[]
}

export default function HomePage({topProducts, latestProducts}: Props) {
  return (
    <>
      <HeroShowcase />
      <PopularCategories />
      <ProductGrid title="Trending" products={topProducts} />
      <ProductGrid title="Latest" products={latestProducts} />
    </>
  );
}
```

### ProductPage

**Файл**: `theme/templates/ProductPage.tsx`

Шаблон страницы товара:

```typescript
type Props = {
  product: ProductModel
  otherProducts: ProductModel[]
  informationSettings: any
  breadcrumbs: BreadcrumbItem[]
}

export default function ProductPage(props: Props) {
  return (
    <>
      <Breadcrumbs items={props.breadcrumbs} />
      <ProductGallery images={props.product.Images} />
      <ProductInfo product={props.product} />
      <VariantSelector variants={props.product.Variants} />
      <ProductGrid title="Other products" products={props.otherProducts} />
    </>
  );
}
```

## Custom Hooks

### useBodyScrollLock

**Файл**: `theme/hooks/useBodyScrollLock.ts`

Блокирует скролл body (для модальных окон):

```typescript
import {useBodyScrollLock} from "@/theme/hooks/useBodyScrollLock";

function MyModal({isOpen}) {
  useBodyScrollLock(isOpen);

  return <div>Modal content</div>
}
```

**Реализация**:

```typescript
import {useEffect} from 'react';

export function useBodyScrollLock(lock: boolean) {
  useEffect(() => {
    if (lock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [lock]);
}
```

## Client vs Server Components

### Server Components (по умолчанию)

- Все компоненты в `app/`
- Templates (обычно)
- Sections (обычно)

**Преимущества**:
- Доступ к БД через Server Actions
- Не увеличивают bundle size
- Лучше для SEO

### Client Components ('use client')

- Snippets с интерактивностью
- Компоненты с hooks (useState, useEffect)
- Компоненты с event handlers

**Примеры**:

```typescript
'use client'
import {useState} from 'react';

export function ProductCart({product}) {
  const [liked, setLiked] = useState(false);

  return (
    <div>
      <button onClick={() => setLiked(!liked)}>
        {liked ? '❤️' : '🤍'}
      </button>
    </div>
  );
}
```

## Composition Pattern

Server Component может передавать данные в Client Component:

```typescript
// Server Component
import ProductCart from './ProductCart';

export default async function ProductList() {
  const products = await getProducts();

  return (
    <div>
      {products.map(product => (
        <ProductCart key={product.id} product={serializeObject(product)} />
      ))}
    </div>
  );
}
```

```typescript
// Client Component
'use client'
export default function ProductCart({product}) {
  const [liked, setLiked] = useState(false);
  // ...
}
```

## Следующие шаги

- [Конфигурация →](./06-configuration.md)
- [Development Guide →](./07-development-guide.md)

[← Назад к оглавлению](./README.md)