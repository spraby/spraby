import {getLatestProducts} from "@/services/Products";
import NewProductsPage from "@/theme/templates/NewProductsPage";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const products = await getLatestProducts(100);
  return <NewProductsPage products={products}/>;
}
