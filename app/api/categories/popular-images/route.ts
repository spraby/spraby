import { NextResponse } from "next/server";
import db from "@/prisma/db.client";
import { CATEGORY_ROTATION_CONFIG, IMAGES_PER_CATEGORY, getRotationIndex } from "@/config/category-rotation";

// In-memory cache для уменьшения нагрузки на БД (очищен для принудительной ротации)
let memoryCache: {
  data: Record<string, CategoryPopularImage> | null;
  expiry: number;
} = {
  data: null,
  expiry: 0,
};

type CategoryPopularImage = {
  images: Array<{
    productId: string;
    imageUrl: string;
  }>;
  productsCount: number;
  cacheUntil: number;
};


/**
 * Получает топ товаров для всех категорий с оптимизированным запросом
 */
async function getTopProductsForAllCategories(): Promise<
  Map<string, { products: Array<{ productId: bigint; imageUrl: string | null }>; productsCount: number }>
> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CATEGORY_ROTATION_CONFIG.statsPeriodDays);

  console.log('[PopularImages] Fetching products with stats since:', cutoffDate);
  console.log('[PopularImages] Config:', {
    statsPeriodDays: CATEGORY_ROTATION_CONFIG.statsPeriodDays,
    poolSize: CATEGORY_ROTATION_CONFIG.poolSize,
    weights: CATEGORY_ROTATION_CONFIG.weights
  });

  const domain = process.env.AWS_IMAGE_DOMAIN ?? "";

  // Оптимизированный запрос с fallback:
  // 1. Пытаемся использовать статистику за указанный период
  // 2. Если статистики нет - используем все товары с их ID как "популярность"
  const results = await db.$queryRaw<
    Array<{
      category_id: bigint;
      category_handle: string;
      product_id: bigint;
      image_src: string | null;
      popularity_score: number;
      rank: number;
      products_count: bigint;
    }>
  >`
    WITH ProductPopularity AS (
      SELECT
        p.id as product_id,
        p.category_id,
        COALESCE(
          SUM(
            CASE
              WHEN ps.type = 'view' THEN ${CATEGORY_ROTATION_CONFIG.weights.view}
              WHEN ps.type = 'click' THEN ${CATEGORY_ROTATION_CONFIG.weights.click}
              WHEN ps.type = 'add_to_cart' THEN ${CATEGORY_ROTATION_CONFIG.weights.add_to_cart}
              ELSE 0
            END
          ),
          p.id::numeric * 0.001
        ) as popularity_score
      FROM products p
      LEFT JOIN product_statistics ps ON ps.product_id = p.id
        AND ps.created_at IS NOT NULL
      WHERE p.enabled = true
        AND p.category_id IS NOT NULL
      GROUP BY p.id, p.category_id
    ),
    RankedProducts AS (
      SELECT
        pp.category_id,
        pp.product_id,
        pp.popularity_score,
        ROW_NUMBER() OVER (
          PARTITION BY pp.category_id
          ORDER BY pp.popularity_score DESC, pp.product_id DESC
        ) as rank
      FROM ProductPopularity pp
    ),
    CategoryCounts AS (
      SELECT
        p.category_id,
        COUNT(*) as products_count
      FROM products p
      WHERE p.enabled = true
        AND p.category_id IS NOT NULL
      GROUP BY p.category_id
    ),
    ProductsWithImages AS (
      SELECT DISTINCT ON (rp.product_id)
        rp.category_id,
        c.handle as category_handle,
        rp.product_id,
        rp.rank,
        i.src as image_src,
        COALESCE(cc.products_count, 0) as products_count
      FROM RankedProducts rp
      LEFT JOIN categories c ON c.id = rp.category_id
      LEFT JOIN CategoryCounts cc ON cc.category_id = rp.category_id
      LEFT JOIN LATERAL (
        SELECT pi.image_id
        FROM product_images pi
        WHERE pi.product_id = rp.product_id
        ORDER BY pi.position ASC
        LIMIT 1
      ) first_image ON true
      LEFT JOIN images i ON i.id = first_image.image_id
      WHERE rp.rank <= ${CATEGORY_ROTATION_CONFIG.poolSize}
    )
    SELECT * FROM ProductsWithImages
    ORDER BY category_id, rank
  `;

  console.log('[PopularImages] Query returned rows:', results.length);

  // Группируем результаты по категориям (используем handle вместо id)
  const categoryMap = new Map<
    string,
    { products: Array<{ productId: bigint; imageUrl: string | null }>; productsCount: number }
  >();

  for (const row of results) {
    const categoryHandle = row.category_handle;
    if (!categoryHandle) continue; // Пропускаем если нет handle

    if (!categoryMap.has(categoryHandle)) {
      categoryMap.set(categoryHandle, {
        products: [],
        productsCount: Number(row.products_count) || 0,
      });
    }

    // Пропускаем товары без изображений
    if (!row.image_src) continue;

    const imageUrl = domain
      ? `${domain}/${row.image_src}`
      : `/${row.image_src}`;

    categoryMap.get(categoryHandle)!.products.push({
      productId: row.product_id,
      imageUrl,
    });
  }

  return categoryMap;
}

/**
 * Генерирует популярные изображения для всех категорий
 */
async function generatePopularImages(): Promise<
  Record<string, CategoryPopularImage>
> {
  const categoryProductsMap = await getTopProductsForAllCategories();
  console.log('[PopularImages] Categories found:', categoryProductsMap.size);

  const rotationIndex = getRotationIndex(CATEGORY_ROTATION_CONFIG.poolSize);
  const cacheUntil = Date.now() + CATEGORY_ROTATION_CONFIG.cacheDuration * 1000;

  const result: Record<string, CategoryPopularImage> = {};

  for (const [categoryHandle, categoryData] of Array.from(categoryProductsMap.entries())) {
    console.log(`[PopularImages] Processing category: ${categoryHandle}, products: ${categoryData.products.length}`);

    if (categoryData.products.length === 0) continue;

    // Берем нужное количество товаров с ротацией (гарантированно с изображениями)
    const images = [];
    for (let i = 0; i < IMAGES_PER_CATEGORY && i < categoryData.products.length; i++) {
      const index = (rotationIndex + i) % categoryData.products.length;
      const product = categoryData.products[index];

      // Дополнительная проверка на всякий случай
      if (!product.imageUrl) {
        console.warn(`[PopularImages] Product ${product.productId} has no imageUrl`);
        continue;
      }

      images.push({
        productId: product.productId.toString(),
        imageUrl: product.imageUrl,
      });
    }

    console.log(`[PopularImages] Category ${categoryHandle}: ${images.length} images added`);

    result[categoryHandle] = {
      images,
      productsCount: categoryData.productsCount,
      cacheUntil,
    };
  }

  console.log('[PopularImages] Total categories with images:', Object.keys(result).length);
  return result;
}

export async function GET(request: Request) {
  try {
    // 1. Проверяем memory cache
    if (memoryCache.data && Date.now() < memoryCache.expiry) {
      return NextResponse.json(memoryCache.data, {
        headers: {
          "Cache-Control":
            "public, max-age=1800, s-maxage=7200, stale-while-revalidate=86400",
          "X-Cache": "HIT-Memory",
        },
      });
    }

    // 2. Генерируем свежие данные
    const freshData = await generatePopularImages();

    // 3. Сохраняем в memory cache
    memoryCache = {
      data: freshData,
      expiry: Date.now() + 1800000, // 30 minutes
    };

    return NextResponse.json(freshData, {
      headers: {
        "Cache-Control":
          "public, max-age=1800, s-maxage=7200, stale-while-revalidate=86400",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Failed to generate popular images:", error);

    // Возвращаем пустой объект при ошибке
    return NextResponse.json(
      {},
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
