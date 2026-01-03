import HomePage from "@/theme/templates/HomePage";
import {getLatestProducts, getProductsOnTrend} from "@/services/Products";
import {getPopularCategoriesByViews} from "@/services/Categories";

// Функция для получения популярных изображений категорий
async function getCategoryPopularImages() {
  try {
    // Для SSR используем полный URL (обязательно для fetch в серверных компонентах)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';
    const response = await fetch(`${baseUrl}/api/categories/popular-images`, {
      next: { revalidate: 600 }, // ISR: обновлять каждые 10 минут
    });

    if (!response.ok) {
      console.error('Failed to fetch popular images:', response.statusText);
      return {};
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching popular images:', error);
    return {};
  }
}

export default async function Page() {
  const [topProducts, latestProducts, popularCategories, popularImages] = await Promise.all([
    getProductsOnTrend(),
    getLatestProducts(19),
    getPopularCategoriesByViews(9),
    getCategoryPopularImages()
  ]);

  return <HomePage
    topProducts={topProducts}
    latestProducts={latestProducts}
    popularCategories={popularCategories}
    popularImages={popularImages}
  />
}
