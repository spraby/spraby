'use server';

import {unstable_cache} from 'next/cache';

import {
  POPULAR_CATEGORIES_CACHE_TAG,
  POPULAR_CATEGORIES_CONFIG,
} from '@/config/category-rotation';
import db from '@/prisma/db.client';
import type {
  PopularCategoryCard,
  PopularCategoryImage,
} from '@/types/popular-categories';

type PopularCategoryCandidate = PopularCategoryImage;

type PopularCategoryPoolItem = {
  id: string;
  title: string;
  href: string;
  productsCount: number;
  candidates: PopularCategoryCandidate[];
};

type PopularCategoryRow = {
  category_rank: bigint;
  category_handle: string;
  category_title: string | null;
  category_name: string | null;
  products_count: bigint;
  product_id: bigint | null;
  image_src: string | null;
  product_rank: bigint | null;
};

const loadPopularCategoryPool = unstable_cache(
  async (): Promise<PopularCategoryPoolItem[]> => {
    const cutoffDate = new Date(
      Date.now() - POPULAR_CATEGORIES_CONFIG.statisticsPeriodDays * 24 * 60 * 60 * 1000,
    );

    const rows = await db.$queryRaw<PopularCategoryRow[]>`
      WITH recent_product_metrics AS (
        SELECT
          ps.product_id,
          COUNT(*) FILTER (WHERE ps.type = 'view')::bigint AS view_count,
          SUM(
            CASE
              WHEN ps.type = 'view' THEN ${POPULAR_CATEGORIES_CONFIG.weights.view}
              WHEN ps.type = 'click' THEN ${POPULAR_CATEGORIES_CONFIG.weights.click}
              WHEN ps.type = 'add_to_cart' THEN ${POPULAR_CATEGORIES_CONFIG.weights.addToCart}
              ELSE 0
            END
          )::bigint AS popularity_score
        FROM product_statistics ps
        WHERE ps.created_at >= ${cutoffDate}
          AND ps.type IN ('view', 'click', 'add_to_cart')
        GROUP BY ps.product_id
      ),
      enabled_products AS (
        SELECT
          p.id AS product_id,
          p.category_id,
          p.created_at,
          COALESCE(rpm.view_count, 0)::bigint AS view_count,
          COALESCE(rpm.popularity_score, 0)::bigint AS popularity_score
        FROM products p
        LEFT JOIN recent_product_metrics rpm ON rpm.product_id = p.id
        WHERE p.enabled = true
          AND p.category_id IS NOT NULL
      ),
      category_metrics AS (
        SELECT
          c.id AS category_id,
          c.handle AS category_handle,
          c.title AS category_title,
          c.name AS category_name,
          COALESCE(SUM(ep.view_count), 0)::bigint AS view_count,
          COUNT(ep.product_id)::bigint AS products_count
        FROM enabled_products ep
        INNER JOIN categories c ON c.id = ep.category_id
        WHERE c.handle IS NOT NULL
        GROUP BY c.id, c.handle, c.title, c.name
      ),
      ranked_categories AS (
        SELECT
          cm.*,
          ROW_NUMBER() OVER (
            ORDER BY cm.view_count DESC, cm.products_count DESC, cm.category_id DESC
          ) AS category_rank
        FROM category_metrics cm
      ),
      top_categories AS (
        SELECT *
        FROM ranked_categories
        WHERE category_rank <= ${POPULAR_CATEGORIES_CONFIG.categoryLimit}
      ),
      products_with_images AS (
        SELECT
          ep.product_id,
          ep.category_id,
          ep.created_at,
          ep.popularity_score,
          first_image.src AS image_src
        FROM enabled_products ep
        INNER JOIN top_categories tc ON tc.category_id = ep.category_id
        INNER JOIN LATERAL (
          SELECT i.src
          FROM product_images pi
          INNER JOIN images i ON i.id = pi.image_id
          WHERE pi.product_id = ep.product_id
            AND i.src IS NOT NULL
            AND i.src <> ''
          ORDER BY pi.position ASC, pi.id ASC
          LIMIT 1
        ) first_image ON true
      ),
      ranked_products AS (
        SELECT
          pwi.*,
          ROW_NUMBER() OVER (
            PARTITION BY pwi.category_id
            ORDER BY
              pwi.popularity_score DESC,
              pwi.created_at DESC NULLS LAST,
              pwi.product_id DESC
          ) AS product_rank
        FROM products_with_images pwi
      )
      SELECT
        tc.category_rank,
        tc.category_handle,
        tc.category_title,
        tc.category_name,
        tc.products_count,
        rp.product_id,
        rp.image_src,
        rp.product_rank
      FROM top_categories tc
      LEFT JOIN ranked_products rp
        ON rp.category_id = tc.category_id
        AND rp.product_rank <= ${POPULAR_CATEGORIES_CONFIG.candidatePoolSize}
      ORDER BY tc.category_rank ASC, rp.product_rank ASC
    `;

    const categories = new Map<string, PopularCategoryPoolItem>();

    for (const row of rows) {
      let category = categories.get(row.category_handle);

      if (!category) {
        category = {
          id: row.category_handle,
          title: row.category_title || row.category_name || row.category_handle,
          href: `/categories/${row.category_handle}`,
          productsCount: Number(row.products_count),
          candidates: [],
        };
        categories.set(row.category_handle, category);
      }

      if (!row.product_id || !row.image_src) continue;

      const imageUrl = normalizeImageUrl(row.image_src);
      if (!imageUrl) continue;

      category.candidates.push({
        productId: row.product_id.toString(),
        imageUrl,
      });
    }

    return Array.from(categories.values());
  },
  ['home:popular-categories:pool:v1'],
  {
    revalidate: POPULAR_CATEGORIES_CONFIG.rankingCacheSeconds,
    tags: [POPULAR_CATEGORIES_CACHE_TAG],
  },
);

/**
 * Возвращает готовые карточки для одного часового интервала.
 * Выбор детерминирован: все процессы приложения получают одинаковые картинки.
 */
export async function getHomePopularCategories(): Promise<PopularCategoryCard[]> {
  try {
    const pool = await loadPopularCategoryPool();
    const now = Date.now();
    const rotationMilliseconds = POPULAR_CATEGORIES_CONFIG.rotationSeconds * 1000;
    const rotationSlot = Math.floor(now / rotationMilliseconds);
    const cacheUntil = now + rotationMilliseconds;

    return pool.map(category => ({
      id: category.id,
      title: category.title,
      href: category.href,
      productsCount: category.productsCount,
      cacheUntil,
      images: selectRotatedImages(category.candidates, category.id, rotationSlot),
    }));
  } catch (error) {
    console.error('[HomePopularCategories] Failed to load popular categories', error);
    return [];
  }
}

function selectRotatedImages(
  candidates: PopularCategoryCandidate[],
  categoryId: string,
  rotationSlot: number,
): PopularCategoryImage[] {
  return candidates
    .map(candidate => ({
      candidate,
      order: stableHash(`${rotationSlot}:${categoryId}:${candidate.productId}`),
    }))
    .sort((left, right) => (
      left.order - right.order
      || left.candidate.productId.localeCompare(right.candidate.productId)
    ))
    .slice(0, POPULAR_CATEGORIES_CONFIG.imagesPerCategory)
    .map(({candidate}) => candidate);
}

function stableHash(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function normalizeImageUrl(source: string): string | null {
  const value = source.trim();
  if (!value) return null;

  const imageDomain = (process.env.AWS_IMAGE_DOMAIN ?? '').replace(/\/+$/, '');

  if (/^https?:\/\//i.test(value)) {
    return !imageDomain || value.startsWith(`${imageDomain}/`) ? value : null;
  }

  const path = value.replace(/^\/+/, '');
  return imageDomain ? `${imageDomain}/${path}` : `/${path}`;
}
