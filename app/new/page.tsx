import {getLatestProducts} from "@/services/Products";
import NewProductsPage from "@/theme/templates/NewProductsPage";

export const revalidate = 120;

export default async function Page() {
  const products = await getLatestProducts(100);
  return <NewProductsPage products={products}/>;
}
