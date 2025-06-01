import HomePage from "@/theme/templates/HomePage";
import {getProductsOnTrend} from "@/services/Products";

export default async function Page() {
  const topProducts = await getProductsOnTrend();
  return <HomePage topProducts={topProducts}/>
}
