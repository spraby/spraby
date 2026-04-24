'use client'

import ProductCart from "@/theme/snippents/ProductCart";
import {ProductCardModel} from "@/prisma/types";
import PopularCategories, {PopularCategory, CategoryPopularImage} from "@/theme/sections/PopularCategories";
import Link from "next/link";
import SprabyHero from "@/theme/sections/SprabyHero";

type HomePageProps = {
  topProducts: ProductCardModel[]
  latestProducts: ProductCardModel[]
  popularCategories: PopularCategory[]
  popularImages?: Record<string, CategoryPopularImage>
}

const normalizeProducts = (products: ProductCardModel[]) => {
  const result: ProductCardModel[] = [];
  const seen = new Set<string>();

  for (const product of products) {
    const image = (product?.Images ?? []).find(i => !!i?.Image?.src);
    if (!image?.Image?.src) continue;
    const key = String(product.id);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(product);
    if (result.length === 19) break;
  }

  return result;
};

const ViewAllCard = ({href, label}: { href: string, label: string }) => (
  <div className="flex flex-col gap-2 p-2">
    <Link
      href={href}
      className="group relative aspect-square overflow-hidden rounded-[0.375rem] border border-purple-300 bg-white transition hover:border-purple-400"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-purple-400">{label}</span>
        <span className="text-lg font-semibold text-purple-600">Смотреть все</span>
        <span className="text-xs text-purple-400">Откройте полный список</span>
      </div>
    </Link>
  </div>
);

export default function HomePage({topProducts, latestProducts, popularCategories, popularImages}: HomePageProps) {
  const productsWithImages = normalizeProducts(topProducts);
  const latestProductsWithImages = normalizeProducts(latestProducts);

  const renderGrid = (items: ProductCardModel[], viewAllHref: string, viewAllLabel: string) => {
    const itemCards = items.slice(0, 19).map(product => (
      <ProductCart key={`product-${String(product.id)}`} product={product}/>
    ));

    // Добавляем ViewAllCard в конец
    itemCards.push(<ViewAllCard key="view-all" href={viewAllHref} label={viewAllLabel}/>);

    return (
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {itemCards}
      </div>
    );
  };

  return <main className="px-4 pb-20 sm:px-6 lg:px-8">
    <div className="mx-auto flex max-w-6xl flex-col gap-12 sm:gap-16">
      <SprabyHero/>

      {productsWithImages.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">В тренде прямо сейчас</h2>
            <p className="text-sm text-gray-500">Отобрали самые просматриваемые товары за последнюю неделю</p>
          </div>
          {renderGrid(productsWithImages, '/trending', 'В тренде')}
        </section>
      )}

      <PopularCategories
        items={popularCategories.length ? popularCategories : POPULAR_CATEGORY_ITEMS}
        popularImages={popularImages}
      />

      {latestProductsWithImages.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Новинки</h2>
            <p className="text-sm text-gray-500">Недавно добавленные товары</p>
          </div>
          {renderGrid(latestProductsWithImages, '/new', 'Новинки')}
        </section>
      )}
    </div>
  </main>
}

const POPULAR_CATEGORY_ITEMS: PopularCategory[] = [
  {id: 'tees', title: 'Футболки', href: '/categories/tees'},
  {id: 'sweatshirts', title: 'Свитшоты', href: '/categories/sweatshirts'},
  {id: 'watch', title: 'Наручные часы', href: '/categories/watches'},
  {id: 'cardholders', title: 'Картхолдеры', href: '/categories/cardholders'},
  {id: 'chairs', title: 'Стулья', href: '/categories/chairs'},
  {id: 'bedding', title: 'Постельное бельё', href: '/categories/bedding'},
];
