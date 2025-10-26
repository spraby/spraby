'use client'

import ProductCart from "@/theme/snippents/ProductCart";
import {ProductModel} from "@/prisma/types";
import HeroShowcase, {HeroCard} from "@/theme/sections/HeroShowcase";
import PopularCategories, {PopularCategory} from "@/theme/sections/PopularCategories";
import Link from "next/link";

type HomePageProps = {
  topProducts: ProductModel[]
  latestProducts: ProductModel[]
}

const GRID_ITEM_COUNT = 14;
const TOTAL_GRID_SLOTS = GRID_ITEM_COUNT + 1;

const normalizeProducts = (products: ProductModel[]) => {
  const result: ProductModel[] = [];
  const seen = new Set<string>();

  for (const product of products) {
    const image = (product?.Images ?? []).find(i => !!i?.Image?.src);
    if (!image?.Image?.src) continue;
    const key = String(product.id);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(product);
    if (result.length === GRID_ITEM_COUNT) break;
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

const EmptySlot = () => (
  <div className="flex flex-col gap-2 p-2 opacity-0 pointer-events-none select-none">
    <div className="aspect-square rounded-[0.375rem] border border-transparent" />
  </div>
);

export default function HomePage({topProducts, latestProducts}: HomePageProps) {
  const productsWithImages = normalizeProducts(topProducts);
  const latestProductsWithImages = normalizeProducts(latestProducts);

const renderGrid = (items: ProductModel[], viewAllHref: string, viewAllLabel: string) => {
    const itemCards = items.slice(0, GRID_ITEM_COUNT).map(product => (
      <ProductCart key={`product-${String(product.id)}`} product={product}/>
    ));
    while (itemCards.length < GRID_ITEM_COUNT) {
      itemCards.push(<EmptySlot key={`empty-${itemCards.length}`}/>);
    }

    const cards = [...itemCards, <EmptySlot key="empty-last"/>];
    cards[GRID_ITEM_COUNT - 1] = <ViewAllCard key="view-all" href={viewAllHref} label={viewAllLabel}/>;

    return (
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cards.slice(0, TOTAL_GRID_SLOTS)}
      </div>
    );
  };

  return <main className="px-4 pt-6 pb-20 sm:px-6 lg:px-8">
    <div className="mx-auto flex max-w-6xl flex-col gap-12 sm:gap-16">
      <HeroShowcase cards={HERO_CARDS}/>

      {productsWithImages.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">В тренде прямо сейчас</h2>
            <p className="text-sm text-gray-500">Отобрали самые просматриваемые товары за последнюю неделю</p>
          </div>
          {renderGrid(productsWithImages, '/collections?sort=trending', 'В тренде')}
        </section>
      )}

      <PopularCategories items={POPULAR_CATEGORY_ITEMS}/>

      {latestProductsWithImages.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Новинки</h2>
            <p className="text-sm text-gray-500">Последние 15 товаров, добавленные на площадку</p>
          </div>
          {renderGrid(latestProductsWithImages, '/collections?sort=new', 'Новинки')}
        </section>
      )}
    </div>
  </main>
}

const HERO_CARDS: HeroCard[] = [
  {
    id: 'shock-prices',
    eyebrow: 'Новая подборка',
    title: 'Шокирующие цены',
    subtitle: 'Аксессуары со скидкой 40%',
    description: 'Подчеркните стиль при помощи украшений и аксессуаров от локальных дизайнеров — только до конца недели.',
    expiresAtLabel: 'Акция действует до 24 октября',
    cta: {label: 'Смотреть', href: '/collections/accessories'},
  },
  {
    id: 'velvet-season',
    eyebrow: 'Спецпредложение',
    title: 'Бархатный сезон скидок',
    subtitle: 'Скидки до 70%',
    description: 'Мягкие фактуры, спокойные оттенки и самые уютные вещи в одном месте.',
    cta: {label: 'Выбрать образ', href: '/collections/fall'},
  },
  {
    id: 'prints-drop',
    eyebrow: 'Новинка',
    title: 'Актуальные товары',
    subtitle: 'Взгляни на принты по‑новому',
    description: 'Коллаборации с художниками и лимитированные капсулы — успей выбрать до распродажи.',
    cta: {label: 'Исследовать', href: '/collections/prints'},
  },
  {
    id: 'bundle-offer',
    eyebrow: 'Вместе дешевле',
    title: 'Создай комплект',
    subtitle: 'Скидка при покупке набора',
    description: 'Добавь три товара одного бренда в корзину и получи дополнительную скидку 15%.',
    cta: {label: 'Собрать сет', href: '/collections/bundles'},
  },
];

const POPULAR_CATEGORY_ITEMS: PopularCategory[] = [
  {id: 'tees', title: 'Футболки', href: '/categories/tees'},
  {id: 'sweatshirts', title: 'Свитшоты', href: '/categories/sweatshirts'},
  {id: 'watch', title: 'Наручные часы', href: '/categories/watches'},
  {id: 'cardholders', title: 'Картхолдеры', href: '/categories/cardholders'},
  {id: 'chairs', title: 'Стулья', href: '/categories/chairs'},
  {id: 'bedding', title: 'Постельное бельё', href: '/categories/bedding'},
];
