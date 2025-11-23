# Prisma Schema и модели данных

[← Назад к оглавлению](./README.md)

## Обзор

Prisma Schema находится в `prisma/schema.prisma` и описывает структуру PostgreSQL базы данных. Эта БД **shared** между Laravel API и Next.js Store.

## Datasource Configuration

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")       // Connection pooling (PgBouncer)
  directUrl = env("POSTGRES_URL_NON_POOLING")  // Direct connection
}

generator client {
  provider = "prisma-client-js"
}
```

## Enum Types

### order_status
```prisma
enum order_status {
  pending      // Ожидает подтверждения
  confirmed    // Подтвержден
  processing   // В обработке
  completed    // Завершен
  cancelled    // Отменен
  archived     // Архивирован
}
```

### delivery_status
```prisma
enum delivery_status {
  pending      // Ожидает упаковки
  packing      // Упаковывается
  shipped      // Отправлен
  transit      // В пути
  delivered    // Доставлен
}
```

### financial_status
```prisma
enum financial_status {
  unpaid        // Не оплачен
  paid          // Оплачен
  partial_paid  // Частично оплачен
  refunded      // Возвращен
}
```

## Основные модели

### users (Пользователи)

```prisma
model users {
  id         BigInt   @id @default(autoincrement())
  first_name String?
  last_name  String?
  email      String   @unique
  password   String
  updated_at DateTime @updatedAt
  created_at DateTime @default(now())
  Brands     brands[]
}
```

**Назначение**: Пользователи системы (владельцы брендов, администраторы).

**Связи**:
- `Brands` → один пользователь может иметь несколько брендов

---

### brands (Бренды)

```prisma
model brands {
  id          BigInt           @id @default(autoincrement())
  user_id     BigInt?
  name        String
  description String?
  updated_at  DateTime         @updatedAt
  created_at  DateTime         @default(now())

  User        users?           @relation(fields: [user_id], references: [id], onDelete: SetNull)
  Products    products[]
  Categories  categories[]
  Images      images[]
  Settings    brand_settings[]
  orders      orders[]
}
```

**Назначение**: Бренды магазина. Каждый товар принадлежит одному бренду.

**Связи**:
- `User` → владелец бренда (опционально)
- `Products` → товары бренда
- `Categories` → категории бренда (many-to-many)
- `Images` → изображения бренда (many-to-many)
- `Settings` → настройки бренда
- `orders` → заказы бренда

---

### categories (Категории)

```prisma
model categories {
  id                 BigInt                @id @default(autoincrement())
  handle             String                @unique
  name               String
  title              String
  header             String?
  description        String?
  updated_at         DateTime              @updatedAt
  created_at         DateTime              @default(now())

  CategoryOption     category_option[]
  Brands             brands[]
  Products           products[]
  CategoryCollection category_collection[]
}
```

**Назначение**: Категории товаров (например: "Электроника", "Одежда").

**Важные поля**:
- `handle` - уникальный slug для URL (например: "electronics")
- `title` - отображаемое название
- `header` - заголовок для страницы категории
- `description` - описание для SEO

**Связи**:
- `CategoryOption` → опции доступные в категории (many-to-many)
- `Brands` → бренды в категории (many-to-many)
- `Products` → товары в категории
- `CategoryCollection` → коллекции в категории (many-to-many)

---

### collections (Коллекции)

```prisma
model collections {
  id                 BigInt                @id @default(autoincrement())
  handle             String                @unique
  name               String
  title              String
  header             String?
  description        String?
  updated_at         DateTime              @updatedAt
  created_at         DateTime              @default(now())

  CategoryCollection category_collection[]
}
```

**Назначение**: Коллекции товаров (например: "Весна 2025", "Распродажа").

**Связи**:
- `CategoryCollection` → категории в коллекции (many-to-many)

---

### products (Товары)

```prisma
model products {
  id          BigInt              @id @default(autoincrement())
  brand_id    BigInt
  category_id BigInt?
  title       String
  description String?
  enabled     Boolean             @default(true)
  price       Decimal             @default(0) @db.Decimal(10, 2)
  final_price Decimal             @default(0) @db.Decimal(10, 2)
  updated_at  DateTime            @updatedAt
  created_at  DateTime            @default(now())

  Brand       brands              @relation(fields: [brand_id], references: [id], onDelete: Cascade)
  Category    categories?         @relation(fields: [category_id], references: [id], onDelete: SetNull)
  Variants    variants[]
  Images      product_images[]
  OrderItems  order_items[]
  Statistics  ProductStatistics[]
}
```

**Назначение**: Основная модель товаров.

**Важные поля**:
- `enabled` - показывать ли товар на фронте
- `price` - базовая цена (Decimal 10,2)
- `final_price` - цена со скидкой (Decimal 10,2)

**Типы данных**:
- `Decimal` → в TypeScript возвращается как Prisma.Decimal объект
- Services автоматически конвертируют в string: `price: "${product.price}"`

**Связи**:
- `Brand` → бренд товара (обязательно, cascade delete)
- `Category` → категория товара (опционально)
- `Variants` → варианты товара (например: разные цвета/размеры)
- `Images` → изображения товара
- `OrderItems` → позиции в заказах
- `Statistics` → статистика просмотров

---

### variants (Варианты товара)

```prisma
model variants {
  id           BigInt           @id @default(autoincrement())
  product_id   BigInt
  image_id     BigInt?
  title        String?
  price        Decimal          @default(0) @db.Decimal(10, 2)
  final_price  Decimal          @default(0) @db.Decimal(10, 2)
  enabled      Boolean          @default(true)
  updated_at   DateTime         @updatedAt
  created_at   DateTime         @default(now())

  Product      products         @relation(fields: [product_id], references: [id], onDelete: Cascade)
  Image        product_images?  @relation(fields: [image_id], references: [id], onDelete: SetNull)
  VariantValue variant_values[]
  order_items  order_items[]
}
```

**Назначение**: Конкретные варианты товара (например: "Красная футболка XL").

**Важные поля**:
- `title` - название варианта (опционально)
- `image_id` - специфичное изображение для варианта
- `enabled` - доступен ли вариант

**Связи**:
- `Product` → товар (cascade delete)
- `Image` → изображение варианта через product_images
- `VariantValue` → значения опций варианта
- `order_items` → позиции в заказах

---

### options (Опции товаров)

```prisma
model options {
  id            BigInt            @id @default(autoincrement())
  name          String
  title         String
  description   String?
  updated_at    DateTime          @updatedAt
  created_at    DateTime          @default(now())

  Values        option_values[]
  Categories    category_option[]
  VariantValues variant_values[]
}
```

**Назначение**: Типы опций товаров (например: "Цвет", "Размер", "Материал").

**Пример**:
- `name: "color"`
- `title: "Цвет"`

**Связи**:
- `Values` → возможные значения опции
- `Categories` → в каких категориях используется (many-to-many)
- `VariantValues` → связь с вариантами товаров

---

### option_values (Значения опций)

```prisma
model option_values {
  id            BigInt           @id @default(autoincrement())
  option_id     BigInt
  value         String
  position      Int              @default(0)
  updated_at    DateTime         @updatedAt
  created_at    DateTime         @default(now())

  Option        options          @relation(fields: [option_id], references: [id], onDelete: Cascade)
  VariantValues variant_values[]
}
```

**Назначение**: Конкретные значения опций.

**Примеры**:
- `value: "Красный"` (для option "Цвет")
- `value: "XL"` (для option "Размер")

**Важные поля**:
- `position` - порядок сортировки значений

**Связи**:
- `Option` → опция (cascade delete)
- `VariantValues` → связь с вариантами

---

### variant_values (Значения опций варианта)

```prisma
model variant_values {
  id              BigInt        @id @default(autoincrement())
  variant_id      BigInt
  option_id       BigInt
  option_value_id BigInt
  updated_at      DateTime      @updatedAt
  created_at      DateTime      @default(now())

  Variant         variants      @relation(fields: [variant_id], references: [id], onDelete: Cascade)
  Option          options       @relation(fields: [option_id], references: [id], onDelete: Cascade)
  Value           option_values @relation(fields: [option_value_id], references: [id], onDelete: Cascade)

  @@unique([variant_id, option_id])
  @@unique([variant_id, option_id, option_value_id])
}
```

**Назначение**: Связывает вариант товара с конкретными значениями опций.

**Пример**:
Вариант "Красная футболка XL" имеет две записи:
1. `option_id: 1 (Цвет), option_value_id: 5 (Красный)`
2. `option_id: 2 (Размер), option_value_id: 10 (XL)`

**Уникальность**:
- Один вариант не может иметь две разных значения одной опции
- Комбинация вариант + опция + значение уникальна

---

### images (Изображения)

```prisma
model images {
  id            BigInt           @id @default(autoincrement())
  name          String
  src           String           // Путь в S3
  alt           String?
  meta          String?
  updated_at    DateTime         @updatedAt
  created_at    DateTime         @default(now())

  Brands        brands[]
  ProductImages product_images[]
}
```

**Назначение**: Хранение метаданных изображений из S3.

**Важные поля**:
- `src` - путь в S3 (без домена), например: "products/img123.jpg"
- `alt` - альтернативный текст для SEO
- `meta` - дополнительная метаинформация (JSON)

**Формирование URL**:
```typescript
const fullUrl = `${process.env.AWS_IMAGE_DOMAIN}/${image.src}`;
// Результат: "https://spraby.s3.eu-north-1.amazonaws.com/products/img123.jpg"
```

**Связи**:
- `Brands` → логотипы брендов (many-to-many)
- `ProductImages` → связь с товарами

---

### product_images (Связь товаров и изображений)

```prisma
model product_images {
  id          BigInt        @id @default(autoincrement())
  product_id  BigInt
  image_id    BigInt
  position    Int           @default(0)
  updated_at  DateTime      @updatedAt
  created_at  DateTime      @default(now())

  Product     products      @relation(fields: [product_id], references: [id], onDelete: Cascade)
  Image       images        @relation(fields: [image_id], references: [id], onDelete: Cascade)
  Variant     variants[]
  order_items order_items[]
}
```

**Назначение**: Pivot таблица для many-to-many связи товаров и изображений.

**Важные поля**:
- `position` - порядок отображения изображений (0 = главное фото)

**Связи**:
- `Product` → товар (cascade delete)
- `Image` → изображение (cascade delete)
- `Variant` → варианты могут ссылаться на это изображение
- `order_items` → снимок изображения в заказе

---

### orders (Заказы)

```prisma
model orders {
  id               BigInt            @id @default(autoincrement())
  name             String            // Номер заказа (например: "#12345")
  customer_id      BigInt
  brand_id         BigInt
  note             String?
  status           order_status      @default(pending)
  delivery_status  delivery_status   @default(pending)
  financial_status financial_status  @default(unpaid)
  updated_at       DateTime          @updatedAt
  created_at       DateTime          @default(now())

  Customer         customers         @relation(fields: [customer_id], references: [id], onDelete: Cascade)
  Brand            brands            @relation(fields: [brand_id], references: [id], onDelete: Cascade)
  OrderShippings   order_shippings[]
  OrderItems       order_items[]
}
```

**Назначение**: Заказы покупателей.

**Важные поля**:
- `name` - читаемый номер заказа (например: "#12345")
- `status` - общий статус заказа
- `delivery_status` - статус доставки
- `financial_status` - статус оплаты

**Связи**:
- `Customer` → покупатель (cascade delete)
- `Brand` → бренд (cascade delete)
- `OrderShippings` → информация о доставке
- `OrderItems` → позиции в заказе

---

### order_items (Позиции заказа)

```prisma
model order_items {
  id                BigInt          @id @default(autoincrement())
  order_id          BigInt
  product_id        BigInt
  variant_id        BigInt?
  product_image_id  BigInt?
  title             String
  quantity          Int
  price             Decimal         @db.Decimal(10, 2)
  updated_at        DateTime        @updatedAt
  created_at        DateTime        @default(now())

  Order             orders          @relation(fields: [order_id], references: [id], onDelete: Cascade)
  Product           products        @relation(fields: [product_id], references: [id], onDelete: Cascade)
  Variant           variants?       @relation(fields: [variant_id], references: [id], onDelete: SetNull)
  ProductImage      product_images? @relation(fields: [product_image_id], references: [id], onDelete: SetNull)
}
```

**Назначение**: Отдельные позиции в заказе.

**Важные поля**:
- `title` - снимок названия товара на момент заказа
- `quantity` - количество
- `price` - снимок цены на момент заказа

**Связи**:
- `Order` → заказ (cascade delete)
- `Product` → товар (cascade delete)
- `Variant` → вариант товара (опционально)
- `ProductImage` → снимок изображения (опционально)

---

### customers (Покупатели)

```prisma
model customers {
  id         BigInt   @id @default(autoincrement())
  email      String   @unique
  name       String
  phone      String
  updated_at DateTime @updatedAt
  created_at DateTime @default(now())

  Orders     orders[]
}
```

**Назначение**: Покупатели магазина.

**Связи**:
- `Orders` → заказы покупателя

---

### order_shippings (Доставка заказов)

```prisma
model order_shippings {
  id         BigInt   @id @default(autoincrement())
  order_id   BigInt
  address    String
  city       String
  zip        String
  country    String
  updated_at DateTime @updatedAt
  created_at DateTime @default(now())

  Order      orders   @relation(fields: [order_id], references: [id], onDelete: Cascade)
}
```

**Назначение**: Адрес доставки заказа.

---

### settings (Глобальные настройки)

```prisma
model settings {
  id         BigInt   @id @default(autoincrement())
  key        String   @unique
  data       Json     @default("[]") @db.JsonB
  updated_at DateTime @updatedAt
  created_at DateTime @default(now())
}
```

**Назначение**: Хранение настроек приложения (меню, breadcrumbs и т.д.).

**Формат**:
- `key` - уникальный ключ настройки (например: "main_menu")
- `data` - JSON данные в PostgreSQL JSONB формате

**Примеры использования**:
```typescript
// Получить меню
const menuSetting = await db.settings.findUnique({where: {key: 'main_menu'}});
const menu = menuSetting.data; // JSON object
```

---

### brand_settings (Настройки бренда)

```prisma
model brand_settings {
  id         BigInt   @id @default(autoincrement())
  type       String
  data       Json     @default("{}") @db.JsonB
  brand_id   BigInt
  updated_at DateTime @updatedAt
  created_at DateTime @default(now())

  Brand      brands   @relation(fields: [brand_id], references: [id], onDelete: Cascade)

  @@unique([type, brand_id])
}
```

**Назначение**: Настройки конкретного бренда.

**Уникальность**: Один тип настройки на бренд.

---

### ProductStatistics (Статистика товаров)

```prisma
model ProductStatistics {
  id         BigInt   @id @default(autoincrement())
  product_id BigInt
  type       String   // Например: "view"
  updated_at DateTime @updatedAt
  created_at DateTime @default(now())

  Product    products @relation(fields: [product_id], references: [id], onDelete: Cascade)
}
```

**Назначение**: Отслеживание событий товаров (просмотры, клики и т.д.).

**Типы**:
- `"view"` - просмотр товара

---

## Pivot таблицы (Many-to-Many)

### category_option

```prisma
model category_option {
  category_id BigInt
  option_id   BigInt

  Category    categories @relation(fields: [category_id], references: [id])
  Option      options    @relation(fields: [option_id], references: [id])

  @@id([category_id, option_id])
}
```

**Связь**: Категории ↔ Опции (какие опции доступны в категории)

### category_collection

```prisma
model category_collection {
  category_id   BigInt
  collection_id BigInt

  Category   categories  @relation(fields: [category_id], references: [id])
  Collection collections @relation(fields: [collection_id], references: [id])

  @@id([category_id, collection_id])
}
```

**Связь**: Категории ↔ Коллекции

### brand_image (не показана в excerpt, но существует)

**Связь**: Бренды ↔ Изображения (логотипы брендов)

### brand_category (не показана в excerpt, но существует)

**Связь**: Бренды ↔ Категории

## Особенности работы с Prisma

### BigInt vs Number

PostgreSQL использует BigInt для ID, что создает проблемы с сериализацией:

```typescript
// ❌ Ошибка - BigInt не сериализуется в JSON
const product = await db.products.findFirst({where: {id: 1n}});
return <ClientComponent product={product} />

// ✅ Правильно
import {serializeObject} from "@/services/utilits";
return <ClientComponent product={serializeObject(product)} />
```

### Decimal Fields

```typescript
// Prisma возвращает Decimal объект
product.price // Prisma.Decimal

// Services конвертируют в string
price: `${product.price}` // "99.99"
```

### Cascading Deletes

Большинство связей используют `onDelete: Cascade`:

- Удаление Product → удаляет Variants, ProductImages, OrderItems
- Удаление Brand → удаляет Products, Orders, Settings
- Удаление Order → удаляет OrderItems, OrderShippings

**Будьте осторожны** при удалении!

### Prisma Client Generation

После изменения schema:

```bash
npm run db:generate
# или
npx prisma generate
```

Prisma автоматически сгенерирует TypeScript типы.

## Следующие шаги

- [Services Layer (Server Actions) →](./03-services.md)
- [App Router и страницы →](./04-routing.md)

[← Назад к оглавлению](./README.md)