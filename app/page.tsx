import HomePage from "@/theme/templates/HomePage";
import {getLatestProducts, getProductsOnTrend} from "@/services/Products";

export default async function Page() {
  const [topProducts, latestProducts] = await Promise.all([
    getProductsOnTrend(),
    getLatestProducts(15)
  ]);

  return <HomePage topProducts={topProducts} latestProducts={latestProducts}/>
}
