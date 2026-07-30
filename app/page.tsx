import HomePage from "@/theme/templates/HomePage";
import {getLatestProducts, getProductsOnTrend} from "@/services/Products";
import {getHomePopularCategories} from "@/services/HomePopularCategories";
import {createMetadata} from "@/lib/seo";

// Next.js требует статически анализируемый литерал для route segment config.
export const revalidate = 3600;

export const metadata = createMetadata({
  title: "Маркетплейс авторских товаров",
  description: "Покупайте авторские товары, изделия ручной работы и вещи независимых брендов на spraby. Уникальные находки от мастеров с удобным заказом онлайн.",
  path: "/",
  image: "/img/hero/hero-product-1.webp",
});

export default async function Page() {
  const [topProducts, latestProducts, popularCategories] = await Promise.all([
    getProductsOnTrend(),
    getLatestProducts(19),
    getHomePopularCategories(),
  ]);

  return <HomePage
    topProducts={topProducts}
    latestProducts={latestProducts}
    popularCategories={popularCategories}
  />
}
