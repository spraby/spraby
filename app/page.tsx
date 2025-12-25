import HomePage from "@/theme/templates/HomePage";
import {getLatestProducts, getProductsOnTrend} from "@/services/Products";
import {getPopularCategoriesByViews} from "@/services/Categories";

export default async function Page() {
  const [topProducts, latestProducts, popularCategories] = await Promise.all([
    getProductsOnTrend(),
    getLatestProducts(15),
    getPopularCategoriesByViews(9)
  ]);

  return <HomePage topProducts={topProducts} latestProducts={latestProducts} popularCategories={popularCategories}/>
}
