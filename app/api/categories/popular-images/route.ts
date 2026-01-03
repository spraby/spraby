import { NextResponse } from "next/server";
import db from "@/prisma/db.client";
import { CATEGORY_ROTATION_CONFIG, getRotationIndex } from "@/config/category-rotation";

// In-memory cache для уменьшения нагрузки на БД (очищен для принудительной ротации)
let memoryCache: {
  data: Record<string, CategoryPopularImage> | null;
  expiry: number;
} = {
  data: null,
  expiry: 0,
};

type CategoryPopularImage = {
  productId: string;
  imageUrl: string;
  rotationIndex: number;
  cacheUntil: number;
  productsCount: number;
};


/**
 * Получает топ товаров для всех категорий с оптимизированным запросом
 */
async function getTopProductsForAllCategories(): Promise<
  Map<string, { products: Array<{ productId: bigint; imageUrl: string | null }>; productsCount: number }>
> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CATEGORY_ROTATION_CONFIG.statsPeriodDays);

  const domain = process.env.AWS_IMAGE_DOMAIN ?? "";

  // Оптимизированный запрос: получаем все данные одним запросом
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
          0
        ) as popularity_score
      FROM products p
      LEFT JOIN product_statistics ps ON ps.product_id = p.id
        AND ps.created_at > ${cutoffDate}
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

    const imageUrl = row.image_src
      ? domain
        ? `${domain}/${row.image_src}`
        : `/${row.image_src}`
      : null;

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
  const rotationIndex = getRotationIndex(CATEGORY_ROTATION_CONFIG.poolSize);
  const cacheUntil = Date.now() + CATEGORY_ROTATION_CONFIG.cacheDuration * 1000;

  const result: Record<string, CategoryPopularImage> = {};

  for (const [categoryHandle, categoryData] of categoryProductsMap.entries()) {
    if (categoryData.products.length === 0) continue;

    // Выбираем товар по индексу ротации
    const selectedIndex = rotationIndex % categoryData.products.length;
    const selectedProduct = categoryData.products[selectedIndex];

    result[categoryHandle] = {
      productId: selectedProduct.productId.toString(),
      imageUrl: selectedProduct.imageUrl || "",
      rotationIndex: selectedIndex,
      cacheUntil,
      productsCount: categoryData.productsCount,
    };
  }

  return result;
}

export async function GET(request: Request) {
  try {
    // 1. Проверяем memory cache
    if (memoryCache.data && Date.now() < memoryCache.expiry) {
      return NextResponse.json(memoryCache.data, {
        headers: {
          "Cache-Control":
            "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
          "X-Cache": "HIT-Memory",
        },
      });
    }

    // 2. Генерируем свежие данные
    const freshData = await generatePopularImages();

    // 3. Сохраняем в memory cache
    memoryCache = {
      data: freshData,
      expiry: Date.now() + 300000, // 5 minutes
    };

    return NextResponse.json(freshData, {
      headers: {
        "Cache-Control":
          "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
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
