'use client'

import ProductCart from "@/theme/snippents/ProductCart";
import {ProductModel} from "@/prisma/types";
import HeroShowcase, {HeroCard} from "@/theme/sections/HeroShowcase";
import PopularCategories, {PopularCategory, CategoryPopularImage} from "@/theme/sections/PopularCategories";
import Link from "next/link";
import {getPopularCategoriesByViews} from "@/services/Categories";

type HomePageProps = {
  topProducts: ProductModel[]
  latestProducts: ProductModel[]
  popularCategories: PopularCategory[]
  popularImages?: Record<string, CategoryPopularImage>
}

const GRID_ITEM_COUNT = 14;

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
  <div className="opacity-0 pointer-events-none select-none" aria-hidden="true">
    <div className="aspect-square" />
  </div>
);

export default function HomePage({topProducts, latestProducts, popularCategories, popularImages}: HomePageProps) {
  const productsWithImages = normalizeProducts(topProducts);
  const latestProductsWithImages = normalizeProducts(latestProducts);

const renderGrid = (items: ProductModel[], viewAllHref: string, viewAllLabel: string) => {
    const itemCards = items.slice(0, GRID_ITEM_COUNT).map(product => (
      <ProductCart key={`product-${String(product.id)}`} product={product}/>
    ));
    while (itemCards.length < GRID_ITEM_COUNT) {
      itemCards.push(<EmptySlot key={`empty-${itemCards.length}`}/>);
    }

    // Заменяем последний элемент на ViewAllCard
    itemCards[GRID_ITEM_COUNT - 1] = <ViewAllCard key="view-all" href={viewAllHref} label={viewAllLabel}/>;

    return (
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {itemCards}
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
            <p className="text-sm text-gray-500">Последние 15 товаров, добавленные на площадку</p>
          </div>
          {renderGrid(latestProductsWithImages, '/new', 'Новинки')}
        </section>
      )}
    </div>
  </main>
}

const HERO_CARDS: HeroCard[] = [
  {
    id: 'artisan-table',
    eyebrow: 'Гастро‑подборка',
    title: 'Фермерские продукты',
    subtitle: 'Мёд, сыры и домашняя выпечка',
    description: 'Собрали локальные деликатесы: свежий хлеб, сливочный сыр, ореховые пасты и ягодные джемы — идеально для уютного стола.',
    cta: {label: 'Попробовать', href: '/collections/food'},
    image: {src: '/img/food.png', alt: 'Фермерский хлеб, сыр, ягоды и мёд на столе'},
  },
  {
    id: 'home-cozy',
    eyebrow: 'Уют для дома',
    title: 'Уютный дом',
    subtitle: 'Свечи, пледы и керамика',
    description: 'Создайте спокойную атмосферу с натуральными свечами, плетёными корзинами и мягким текстилем в спокойной гамме.',
    cta: {label: 'Создать уют', href: '/collections/home'},
    image: {src: '/img/home.png', alt: 'Свечи, керамика и плетёный плед в интерьере'},
  },
  {
    id: 'leather-essentials',
    eyebrow: 'Новая коллекция',
    title: 'Кожаные аксессуары',
    subtitle: 'Сумки, кошельки и ремни',
    description: 'Лаконичные формы, натуральная кожа и тёплый карамельный оттенок — для работы, поездок и повседневных образов.',
    cta: {label: 'Посмотреть', href: '/collections/leather'},
    image: {src: '/img/leather.png', alt: 'Кожаные сумки, кошелёк и ремень карамельного цвета'},
  },
  {
    id: 'linen-summer',
    eyebrow: 'Сезон капсул',
    title: 'Льняная капсула',
    subtitle: 'Платья, кардиганы и аксессуары',
    description: 'Льняные платья, вязаные кардиганы и соломенные сумки в природных оттенках — лёгкая капсула для тёплых дней.',
    cta: {label: 'Собрать лук', href: '/collections/linen'},
    image: {src: '/img/wear.png', alt: 'Льняное платье, кардиган и соломенные аксессуары'},
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
