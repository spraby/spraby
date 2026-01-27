import {getTrendingProducts} from "@/services/Products";
import TrendingPage from "@/theme/templates/TrendingPage";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const products = await getTrendingProducts(100);
  return <TrendingPage products={products}/>;
}
