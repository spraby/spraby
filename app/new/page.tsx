import {getLatestProducts} from "@/services/Products";
import NewProductsPage from "@/theme/templates/NewProductsPage";
import {createMetadata} from "@/lib/seo";

export const dynamic = 'force-dynamic';

export const metadata = createMetadata({
  title: "Новые авторские товары",
  description: "Свежие поступления на spraby: новые изделия ручной работы, авторские вещи и товары независимых брендов от мастеров.",
  path: "/new",
});

export default async function Page() {
  const products = await getLatestProducts(100);
  return <NewProductsPage products={products}/>;
}
