# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Customer-facing e-commerce storefront built with Next.js 14 (App Router), React 18, Tailwind 3, NextUI v2. Part of the multi-app Spraby platform sharing a PostgreSQL database (via Prisma) with the Laravel API and admin apps. No REST API layer — the store connects directly to PostgreSQL.

## Development Commands

```bash
npm run dev          # Dev server on port 3010
npm run build        # Production build
npm run lint         # ESLint
npm run db:generate  # Regenerate Prisma client after schema changes
```

`postinstall` hook runs `prisma generate` automatically on `npm install`.

## Architecture

### Data Flow

```
app/**/page.tsx (Server Component — fetches data)
    ↓ calls
services/*.ts ('use server' — all DB queries, price/image mapping)
    ↓ queries via
prisma/db.client.ts (Prisma singleton)
    ↓ returns mapped data to
theme/templates/*.tsx (Client Component — renders UI)
    ↓ composed from
theme/sections/*.tsx + theme/snippents/*.tsx (Client Components)
```

Pages are server components that call services and pass data to client templates. Services own all Prisma queries and are responsible for mapping prices to strings and constructing full image URLs.

### Directory Structure

```
app/                    # Next.js App Router (server components only)
services/               # 'use server' data layer — ALL DB queries go here
  utilits.ts            # serializeObject(), toMoney() — note the typo in filename
theme/
├── layouts/            # AppShell (auth vs main routing), ThemeLayout (providers + chrome)
├── templates/          # Full page client components (HomePage, ProductPage, etc.)
├── sections/           # Page sections (LayoutHeader, LayoutFooter, HeroShowcase)
├── snippents/          # Reusable UI components — note: intentional typo, do not rename
├── hooks/              # useCart, useFavorites, useBodyScrollLock
└── assets/             # SVG icon components
prisma/
├── schema.prisma       # Must stay in sync with api/database/migrations/
├── db.client.ts        # Singleton Prisma client
├── types.ts            # Extended model types with optional relationships
└── safeCall.ts         # handlePrismaError(), safePrismaCall() for DB-unavailable fallback
types/                  # FilterItem, MenuItem, ProductSort
lib/email/              # Resend templates + queue for order notifications
```

### Layout Hierarchy

```
RootLayout (server) — fetches main menu from Settings service
  └── AppShell (client) — routes /login, /register to minimal auth layout; others to:
        └── ThemeLayout (client) — wraps in CartProvider > FavoritesProvider
              └── LayoutHeader + {children} + LayoutFooter
```

AppShell scrolls to top on every route change via `useEffect` on pathname.

## Critical Patterns

### BigInt Serialization

All Prisma IDs are BigInt. When passing data to client components that will access ID fields, wrap with `serializeObject()`:

```typescript
import { serializeObject } from '@/services/utilits';
return <ProductPage product={serializeObject(product)} />;
```

Services already convert prices to strings — `serializeObject()` is only needed for BigInt IDs.

### Price & Image Mapping in Services

Services are responsible for mapping before returning data to pages:

```typescript
// Price: Decimal → string (done in every service that returns products)
price: `${product.price}`,
final_price: `${product.final_price}`,

// Image: relative path → full AWS URL
src: `${process.env.AWS_IMAGE_DOMAIN}/${i.Image?.src}`
```

Never pass raw Prisma results to client components — always go through a service that does this mapping.

### Prisma Error Handling

Services wrap DB calls with `handlePrismaError()` or `safePrismaCall()` from `prisma/safeCall.ts`. On DB-unavailable errors (P1001/P1002/P1017), returns a fallback value instead of crashing. Other errors re-throw.

```typescript
export async function findMany(params?) {
  try {
    return await db.products.findMany(params);
  } catch (error) {
    return handlePrismaError(error, [], 'products.findMany');
  }
}
```

### Pagination

Standard pagination return shape used across services:

```typescript
{ items: T[], paginator: { pageSize, current, total, pages } }
```

### Client State (Cart & Favorites)

Both use localStorage — no server persistence until checkout.

- `useCart()` — localStorage key `spraby_cart`. Merge logic: same product+variant increments quantity.
- `useFavorites()` — localStorage key `spraby_favorites`. Has extensive input normalization for BigInt/price/image validation.
- Both expose a `ready` boolean indicating localStorage has loaded.

### Filter System

Uses `transliteration` package to convert Cyrillic option titles to URL-safe keys:
- "Размер" → `razmer` in URL: `/categories/clothes?razmer=S,M`
- See `services/Options.ts` for `convertOptionsToFilter()`

### Product Statistics Tracking

Cookie-based (not localStorage). Three tracking types:
- `_sp_psv` (view), `_sp_psc` (click), `_sp_psatc` (add to cart)
- 24h cookie expiry, upserts to `productStatistics` table
- Trending products algorithm: top views from last 30 days, falls back to latest products

## Next.js Configuration

- **React Strict Mode**: disabled (`reactStrictMode: false`)
- **Dynamic pages**: most use `export const dynamic = 'force-dynamic'` — no static optimization
- **Image domains**: only `spraby.s3.eu-north-1.amazonaws.com` whitelisted

## Routes

| Path | Purpose |
|------|---------|
| `/` | Home (trending + latest products, popular categories) |
| `/products/[id]` | Product detail |
| `/categories/[handle]` | Category listing with filters |
| `/collections/[handle]` | Collection listing |
| `/search` | Search results |
| `/checkout` | Checkout flow |
| `/favorites` | Wishlist (localStorage-backed) |
| `/api/search` | Search autocomplete API route |

## UI Stack

- **NextUI v2** — primary component library
- **Ant Design** — secondary (Select, Drawer, etc.)
- **Tailwind CSS 3** — all styling (no CSS modules)
- **Splide** — image carousels
- **Framer Motion** — animations
- **React Hook Form + Yup** — form handling
- **Custom Gilroy font** (300, 400, 500, 700, 900 weights)

## Email System

Located in `lib/email/`. Uses **Resend** with React Email templates. Order creation sends customer + seller notifications asynchronously. Controlled by `IS_EMAIL_ENABLED` env var.

## Environment Variables

```env
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
AWS_IMAGE_DOMAIN=https://spraby.s3.eu-north-1.amazonaws.com  # Required — images won't load without it
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3010/login
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@spraby.com
IS_EMAIL_ENABLED=true
```

## Schema Changes

When the database schema changes in Laravel:
1. Update `prisma/schema.prisma` to match the migration
2. Run `npm run db:generate` to regenerate the Prisma client

## Gotchas

- **No test suite** — no Jest, Vitest, or E2E tests configured
- **`snippents/`** directory typo is intentional — do not rename
- **`services/utilits.ts`** filename typo is established — do not rename
- **No `.ai-docs/`** directory exists despite being referenced in root CLAUDE.md
- **Cart/favorites are ephemeral** — only orders persist to the database
- **Menu is stored in `settings` table** as JSON (key='menu'), not a dedicated table
- **All deletions are hard deletes** — no soft delete pattern
- **NextAuth is minimal** — installed but no SessionProvider in layout; auth is basic customer accounts