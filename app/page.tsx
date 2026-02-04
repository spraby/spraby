import HomePage from "@/theme/templates/HomePage";
import {getLatestProducts, getProductsOnTrend} from "@/services/Products";
import {getPopularCategoriesByViews} from "@/services/Categories";
import {POPULAR_CATEGORIES_LIMIT} from "@/config/category-rotation";

export const revalidate = 1800; // ISR: 30 минут

async function getCategoryPopularImages() {
  const TIMEOUT_MS = 5000; // 5 секунд timeout

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

    // Создаем AbortController для timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${baseUrl}/api/categories/popular-images`, {
        next: { revalidate: 1800 },
        cache: 'force-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('[PopularImages] Failed to fetch:', response.status, response.statusText);
        return {};
      }

      const data = await response.json();
      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`[PopularImages] Request timeout after ${TIMEOUT_MS}ms`);
      } else {
        throw fetchError;
      }

      return {};
    }
  } catch (error) {
    console.error('[PopularImages] Error fetching:', error instanceof Error ? error.message : error);
    return {};
  }
}

export default async function Page() {
  const [topProducts, latestProducts, popularCategories, popularImages] = await Promise.all([
    getProductsOnTrend(),
    getLatestProducts(19),
    getPopularCategoriesByViews(POPULAR_CATEGORIES_LIMIT),
    getCategoryPopularImages()
  ]);

  return <HomePage
    topProducts={topProducts}
    latestProducts={latestProducts}
    popularCategories={popularCategories}
    popularImages={popularImages}
  />
}
