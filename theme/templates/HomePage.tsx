'use client'

import ProductCart from "@/theme/snippents/ProductCart";
import {ProductModel} from "@/prisma/types";
import '@splidejs/react-splide/css';
import {Splide, SplideSlide} from "react-splide-ts";
import HeroShowcase, {HeroCard} from "@/theme/sections/HeroShowcase";
import PopularCategories, {PopularCategory} from "@/theme/sections/PopularCategories";

export default function HomePage({topProducts}: { topProducts: ProductModel[] }) {
  const productsWithImages = topProducts.reduce((acc: ProductModel[], product) => {
    const image = (product?.Images ?? []).find(i => !!i?.Image?.src);
    if (image?.Image?.src) acc.push(product);
    return acc;
  }, []);

  return <main className="pb-20">
    <div className="container mx-auto flex flex-col gap-16">
      <HeroShowcase cards={HERO_CARDS}/>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">В тренде прямо сейчас</h2>
          <p className="text-sm text-gray-500">Отобрали самые просматриваемые товары за последнюю неделю</p>
        </div>
        <Splide
          options={{
            perPage: 4,
            gap: '1.5rem',
            breakpoints: {
              320: {perPage: 1},
              640: {perPage: 2},
              768: {perPage: 3},
            },
            arrows: false,
            pagination: false,
          }}
        >
          {
            productsWithImages.map((product, index) => (
              <SplideSlide key={index}>
                <ProductCart product={product}/>
              </SplideSlide>
            ))
          }
        </Splide>
      </section>

      <PopularCategories items={POPULAR_CATEGORY_ITEMS}/>
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
