import {getTrendingProducts} from "@/services/Products";
import TrendingPage from "@/theme/templates/TrendingPage";

export const revalidate = 120;

export default async function Page() {
  const products = await getTrendingProducts(100);
  return <TrendingPage products={products}/>;
}
