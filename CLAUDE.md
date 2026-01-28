# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Customer-facing e-commerce storefront built with Next.js 14 (App Router). Part of the multi-app Spraby platform sharing a PostgreSQL database with the Laravel API and admin apps.

## Development Commands

```bash
npm run dev          # Dev server on port 3010
npm run build        # Production build
npm run lint         # ESLint
npm run db:generate  # Regenerate Prisma client after schema changes
```

## Architecture

### Data Flow

```
app/page.tsx (Server Component)
    ↓ calls
services/*.ts ('use server' modules)
    ↓ queries via
prisma/db.client.ts (Prisma singleton)
    ↓ returns data
theme/templates/*.tsx (Client Components)
```

All database operations go through the `services/` directory. Pages are server components that fetch data and pass it to client-side templates.

### Directory Structure

```
app/                    # Next.js App Router (pages are server components)
services/               # 'use server' data layer - all DB queries here
theme/
├── layouts/           # AppShell, ThemeLayout
├── templates/         # Full page components (HomePage, ProductPage, etc.)
├── sections/          # Page sections (LayoutHeader, LayoutFooter, HeroShowcase)
├── snippents/         # Reusable UI components (note: intentional typo in dir name)
├── hooks/             # useCart, useFavorites (localStorage-backed)
└── assets/            # SVG icon components
prisma/
├── schema.prisma      # Database schema (sync with api/database/migrations)
├── db.client.ts       # Singleton client
├── types.ts           # TypeScript model types with relationships
└── safeCall.ts        # Error handling for DB unavailability
types/                 # FilterItem, MenuItem, ProductSort types
```

### Key Patterns

**BigInt Serialization**: All BigInt IDs must be serialized before passing to client components:
```typescript
import { serializeObject } from '@/services/utilits';
const data = await Products.findFirst(...);
return <Template product={serializeObject(data)} />;
```

**Price Fields**: Decimal prices are converted to strings in services to avoid serialization issues.

**Prisma Error Handling**: Use `safePrismaCall()` wrapper for graceful degradation when DB is unavailable:
```typescript
import { safePrismaCall } from '@/prisma/safeCall';
const result = await safePrismaCall(() => db.product.findMany(), [], 'Products.findMany');
```

**Client State**: Cart and favorites use localStorage via React Context (no server persistence):
- `useCart()` - Shopping cart with merge logic
- `useFavorites()` - Wishlist management

### Key Services

| Service | Purpose |
|---------|---------|
| `Products.ts` | Product queries, filtering, trending/latest |
| `Categories.ts` | Category tree, popularity by views |
| `Collections.ts` | Collection management |
| `Orders.ts` | Order creation |
| `Variants.ts` | Product variant operations |
| `Options.ts` | Filter option conversion |
| `Settings.ts` | Global settings (menu, metadata) |

### Routes

| Path | Purpose |
|------|---------|
| `/` | Home page |
| `/products/[id]` | Product detail |
| `/categories/[handle]` | Category listing |
| `/collections/[handle]` | Collection listing |
| `/search` | Search results |
| `/checkout` | Checkout flow |
| `/favorites` | Wishlist |

### UI Libraries

- **NextUI v2** - Primary component library
- **Ant Design** - Secondary components
- **Tailwind CSS** - Styling with custom Gilroy font
- **Splide** - Image carousels
- **Framer Motion** - Animations

## Environment Variables

```env
# Database (PostgreSQL via Prisma)
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000/login

# AWS S3 Images
AWS_IMAGE_DOMAIN=https://spraby.s3.eu-north-1.amazonaws.com
```

## Schema Changes

When the database schema changes in Laravel:
1. Update `prisma/schema.prisma` to match the migration
2. Run `npm run db:generate` to regenerate the Prisma client