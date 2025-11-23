# TypeScript Types

[← Назад к оглавлению](./README.md)

## Основные типы

**Файл**: `types/index.ts`

```typescript
export type FilterItem = {
  title: string
  key: string
  values: {
    value: string
    optionIds: bigint[]
  }[]
}

export type BreadcrumbItem = {
  title: string
  url: string
}

export type MenuItem = {
  id: number
  url: string
  title: string
  children?: MenuItem[]
}

export type ProductSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc'
```

## Prisma Generated Types

Prisma автоматически генерирует типы после `npm run db:generate`:

```typescript
import {Prisma} from '@prisma/client';

// Модели
type User = Prisma.users;
type Product = Prisma.products;
type Variant = Prisma.variants;

// FindFirst Args
type ProductFindFirstArgs = Prisma.productsFindFirstArgs;

// Include types
type ProductWithRelations = Prisma.productsGetPayload<{
  include: {
    Brand: true
    Category: true
    Variants: true
    Images: {include: {Image: true}}
  }
}>;
```

## Custom Prisma Types

**Файл**: `prisma/types.ts` (если существует)

```typescript
import {Prisma} from '@prisma/client';

// Product с всеми связями
export type ProductModel = Prisma.productsGetPayload<{
  include: {
    Brand: {include: {User: true, Settings: true}}
    Category: {include: {CategoryOption: {include: {Option: true}}}}
    Variants: {include: {VariantValue: {include: {Value: true}}}}
    Images: {include: {Image: true}}
  }
}>;

// Variant с связями
export type VariantModel = Prisma.variantsGetPayload<{
  include: {
    Image: {include: {Image: true}}
    VariantValue: {include: {Value: true, Option: true}}
  }
}>;

// Order с связями
export type OrderModel = Prisma.ordersGetPayload<{
  include: {
    Customer: true
    OrderItems: {include: {Product: true, Variant: true}}
    OrderShippings: true
  }
}>;
```

## Component Props Types

```typescript
// Product Card
type ProductCardProps = {
  product: {
    id: bigint
    title: string
    price: string
    final_price: string
    Images?: {
      Image: {
        src: string
        alt: string | null
      }
    }[]
  }
  onClick?: () => void
}

// Variant Selector
type VariantSelectorProps = {
  variants: VariantModel[]
  selectedVariant?: VariantModel
  onSelect: (variant: VariantModel) => void
}

// Filter
type FilterProps = {
  options: {
    id: bigint
    name: string
    title: string
    Values: {
      id: bigint
      value: string
    }[]
  }[]
  selected: {optionId: number, values: string[]}[]
  onChange: (selected: {optionId: number, values: string[]}[]) => void
}
```

## Server Action Types

```typescript
// Products Service
type GetFilteredProductsFilter = {
  categoryHandles?: string[]
  collectionHandles?: string[]
  options?: {optionId: number, values: string[]}[]
  sort?: ProductSort
  limit?: number
  page?: number
}

type PaginatedProducts = {
  items: (ProductModel & {price: string; final_price: string})[]
  total: number
  page: number
  pageSize: number
}

// Settings Service
type MenuSettings = MenuItem[]
type BreadcrumbSettings = BreadcrumbItem[]
```

## Form Types

```typescript
// Order Form
type OrderFormData = {
  email: string
  name: string
  phone: string
  address: string
  city: string
  zip: string
  country: string
  items: {
    productId: bigint
    variantId?: bigint
    quantity: number
  }[]
}

// Search Form
type SearchFormData = {
  query: string
  categoryId?: bigint
  sort?: ProductSort
}
```

## Utility Types

```typescript
// Serialized (для передачи из Server в Client)
type Serialized<T> = T extends bigint
  ? string
  : T extends Date
  ? string
  : T extends object
  ? {[K in keyof T]: Serialized<T[K]>}
  : T;

type SerializedProduct = Serialized<ProductModel>;

// Optional fields
type PartialProduct = Partial<Product>;

// Required fields
type RequiredProduct = Required<Product>;

// Pick specific fields
type ProductPreview = Pick<Product, 'id' | 'title' | 'price' | 'final_price'>;

// Omit fields
type ProductWithoutDates = Omit<Product, 'created_at' | 'updated_at'>;
```

## React Component Types

```typescript
import {ReactNode, FC, PropsWithChildren} from 'react';

// Functional Component
type MyComponentProps = {
  title: string
  count: number
}

const MyComponent: FC<MyComponentProps> = ({title, count}) => {
  return <div>{title}: {count}</div>
}

// With children
type LayoutProps = PropsWithChildren<{
  menu: MenuItem[]
}>;

const Layout: FC<LayoutProps> = ({children, menu}) => {
  return <div>{children}</div>
}

// Render prop
type RenderPropComponent = {
  render: (data: Product) => ReactNode
}
```

## Enum Types

```typescript
// Order statuses
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'archived';

type DeliveryStatus = 'pending' | 'packing' | 'shipped' | 'transit' | 'delivered';

type FinancialStatus = 'unpaid' | 'paid' | 'partial_paid' | 'refunded';

// Product sort
type ProductSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc';
```

## Generic Types

```typescript
// Paginated response
type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  pages: number
}

type PaginatedProducts = PaginatedResponse<ProductModel>;
type PaginatedOrders = PaginatedResponse<OrderModel>;

// API Response
type APIResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

type ProductResponse = APIResponse<ProductModel>;
```

## Type Guards

```typescript
// Check if object has property
function hasProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

// Check if value is Product
function isProduct(value: unknown): value is ProductModel {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'price' in value
  );
}
```

## Следующие шаги

- [Prisma Schema →](./02-prisma-schema.md)
- [Services Layer →](./03-services.md)

[← Назад к оглавлению](./README.md)