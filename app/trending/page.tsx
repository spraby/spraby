import {getTrendingProducts} from "@/services/Products";
import TrendingPage from "@/theme/templates/TrendingPage";
import {createMetadata} from "@/lib/seo";

export const dynamic = 'force-dynamic';

export const metadata = createMetadata({
  title: "Популярные авторские товары",
  description: "Популярные товары на spraby: изделия ручной работы, авторские вещи и находки от независимых мастеров, которые чаще всего смотрят покупатели.",
  path: "/trending",
});

export default async function Page() {
  const products = await getTrendingProducts(100);
  return <TrendingPage products={products}/>;
}
