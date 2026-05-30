import FavoritePage from "@/theme/templates/FavoritePage";
import {createMetadata} from "@/lib/seo";

export const metadata = createMetadata({
  title: "Избранные товары",
  description: "Список товаров, которые вы добавили в избранное, чтобы заказать их позже.",
  path: "/favorites",
  noIndex: true,
});

export default function Favorites() {
  return <FavoritePage/>;
}
