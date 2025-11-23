# Конфигурация и настройки

[← Назад к оглавлению](./README.md)

## Next.js Configuration

**Файл**: `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'spraby.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ]
  }
};

export default nextConfig;
```

**Важные настройки**:
- `reactStrictMode: false` - отключен для совместимости
- `images.remotePatterns` - разрешенные домены для Next.js Image

## Environment Variables

**Файл**: `.env`

```bash
# Database (connection pooling)
POSTGRES_PRISMA_URL=postgresql://user:pass@host:5435/db?pgbouncer=true

# Database (direct connection)
POSTGRES_URL_NON_POOLING=postgresql://user:pass@host:5435/db

# AWS S3
AWS_IMAGE_DOMAIN=https://spraby.s3.eu-north-1.amazonaws.com
```

**Использование**:

```typescript
// Server-side only (автоматически доступны в Server Components)
const imageUrl = `${process.env.AWS_IMAGE_DOMAIN}/${path}`;

// Client-side (нужен префикс NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Tailwind Configuration

**Файл**: `tailwind.config.ts`

```typescript
import type {Config} from 'tailwindcss';
import {nextui} from '@nextui-org/react';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './theme/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Кастомные цвета
      },
    },
  },
  plugins: [nextui()],
};

export default config;
```

## PostCSS Configuration

**Файл**: `postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## TypeScript Configuration

**Файл**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Path alias**: `@/` указывает на корень проекта.

## AWS Image Loader

**Файл**: `awsImgLoader.js`

```javascript
export default function awsImgLoader({src, width, quality}) {
  return `${process.env.AWS_IMAGE_DOMAIN}/${src}?w=${width}&q=${quality || 75}`;
}
```

**Использование**:

```typescript
import Image from 'next/image';
import awsImgLoader from '@/awsImgLoader';

<Image
  loader={awsImgLoader}
  src="products/img123.jpg"
  width={500}
  height={500}
  alt="Product"
/>
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev -p 3010",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "prisma": "prisma",
    "postinstall": "prisma generate"
  }
}
```

**Команды**:
- `npm run dev` - dev server на порту 3010
- `npm run build` - production build
- `npm run start` - production server
- `npm run db:generate` - генерация Prisma client
- `postinstall` - автоматически генерирует Prisma client после `npm install`

## Prisma Configuration

**Файл**: `prisma/schema.prisma` (конфигурация)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

generator client {
  provider = "prisma-client-js"
}
```

**Генерация клиента**:

```bash
npm run db:generate
```

**Prisma Studio** (GUI для БД):

```bash
npx prisma studio
```

## SCSS/SASS

**Файл**: `styles/index.scss`

Глобальные стили приложения. Импортируется в `app/layout.tsx`.

## Следующие шаги

- [Development Guide →](./07-development-guide.md)
- [TypeScript Types →](./08-types.md)

[← Назад к оглавлению](./README.md)