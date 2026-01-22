import type {Metadata} from "next";
import FavoritePage from "@/theme/templates/FavoritePage";

export const metadata: Metadata = {
  title: 'Избранные товары — Spraby',
  description: 'Список товаров, которые вы добавили в избранное, чтобы заказать их позже.',
};

export default function Favorites() {
  return <FavoritePage/>;
}
