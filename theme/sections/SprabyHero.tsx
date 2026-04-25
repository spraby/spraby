import Image from "next/image";
import Link from "next/link";
import type {CSSProperties, ReactNode} from "react";

import "./SprabyHero.css";

type CSSVariables = CSSProperties & Record<`--${string}`, string>;

type HeroTagConfig = {
  id: string
  content: ReactNode
  desktopClassName: string
  appearDelay: string
  floatDelay: string
}

type HeroProductConfig = {
  id: string
  src: string
  width: number
  height: number
  className: string
  appearDelay: string
  floatDelay: string
  floatX: string
  floatY: string
  productOpacity: string
}

type HeroMobileProductConfig = {
  id: string
  src: string
  width: number
  height: number
  className: string
  productOpacity: string
}

const HERO_LOGO = {
  src: "/img/hero/spraby-logo.webp",
  width: 720,
  height: 720,
};

const HERO_TAGS: HeroTagConfig[] = [
  {
    id: "made-in-belarus",
    content: <>Made in <span className="text-purple-600">Belarus</span></>,
    desktopClassName: "absolute left-[3%] top-[9%] z-20 hidden -rotate-[3deg] md:block lg:left-[11%] lg:top-[8%]",
    appearDelay: "120ms",
    floatDelay: "900ms",
  },
  {
    id: "handmade-with-love",
    content: <>Handmade with <span className="text-rose-500">love</span></>,
    desktopClassName: "absolute right-[2%] top-[25%] z-20 hidden rotate-2 md:block lg:right-[8%] lg:top-[27%]",
    appearDelay: "220ms",
    floatDelay: "1200ms",
  },
  {
    id: "limited-edition",
    content: <>Limited <span className="text-amber-600">edition</span></>,
    desktopClassName: "absolute bottom-[16%] left-[7%] z-20 hidden rotate-[2deg] md:block lg:bottom-[18%] lg:left-[14%]",
    appearDelay: "280ms",
    floatDelay: "1350ms",
  },
  {
    id: "local-brands",
    content: <>Local <span className="text-indigo-600">brands</span></>,
    desktopClassName: "absolute bottom-[2%] right-[5%] z-20 hidden -rotate-1 md:block lg:bottom-[3%] lg:right-[16%]",
    appearDelay: "320ms",
    floatDelay: "1500ms",
  },
];

const HERO_PRODUCTS: HeroProductConfig[] = [
  {
    id: "hero-product-1",
    src: "/img/hero/hero-product-1.webp",
    width: 192,
    height: 189,
    className: "right-[-1%] bottom-[3%] w-[58px] -rotate-[9deg] lg:right-[-7%] lg:bottom-[1%] lg:w-[74px]",
    appearDelay: "200ms",
    floatDelay: "700ms",
    floatX: "4px",
    floatY: "-9px",
    productOpacity: "0.74",
  },
  {
    id: "hero-product-2",
    src: "/img/hero/hero-product-2.webp",
    width: 138,
    height: 192,
    className: "left-[15%] top-[-5%] w-[46px] rotate-[16deg] lg:left-[17%] lg:top-[-8%] lg:w-[56px]",
    appearDelay: "380ms",
    floatDelay: "1750ms",
    floatX: "-4px",
    floatY: "-10px",
    productOpacity: "0.58",
  },
  {
    id: "hero-product-3",
    src: "/img/hero/hero-product-3.webp",
    width: 170,
    height: 192,
    className: "left-[-3%] top-[22%] w-[62px] -rotate-[13deg] lg:left-[-9%] lg:top-[20%] lg:w-[84px]",
    appearDelay: "80ms",
    floatDelay: "400ms",
    floatX: "5px",
    floatY: "-10px",
    productOpacity: "0.78",
  },
  {
    id: "hero-product-4",
    src: "/img/hero/hero-product-4.webp",
    width: 182,
    height: 192,
    className: "right-[-3%] top-[16%] w-[64px] rotate-[11deg] lg:right-[-10%] lg:top-[12%] lg:w-[86px]",
    appearDelay: "320ms",
    floatDelay: "950ms",
    floatX: "3px",
    floatY: "-8px",
    productOpacity: "0.76",
  },
  {
    id: "hero-product-5",
    src: "/img/hero/hero-product-5.webp",
    width: 192,
    height: 190,
    className: "left-[5%] bottom-[1%] w-[43px] rotate-[13deg] lg:left-[2%] lg:bottom-[-2%] lg:w-[54px]",
    appearDelay: "260ms",
    floatDelay: "1500ms",
    floatX: "-5px",
    floatY: "-7px",
    productOpacity: "0.68",
  },
  {
    id: "hero-product-6",
    src: "/img/hero/hero-product-6.webp",
    width: 185,
    height: 192,
    className: "right-[12%] top-[-5%] w-[58px] rotate-[9deg] lg:right-[18%] lg:top-[-8%] lg:w-[70px]",
    appearDelay: "140ms",
    floatDelay: "1100ms",
    floatX: "-4px",
    floatY: "-8px",
    productOpacity: "0.62",
  },
];

const HERO_MOBILE_PRODUCTS: HeroMobileProductConfig[] = [
  {
    id: "hero-product-1",
    src: HERO_PRODUCTS[0].src,
    width: HERO_PRODUCTS[0].width,
    height: HERO_PRODUCTS[0].height,
    className: "left-[1%] top-[11%] w-[50px] -rotate-[12deg] sm:left-[8%] sm:top-[10%] sm:w-[62px]",
    productOpacity: "0.68",
  },
  {
    id: "hero-product-2",
    src: HERO_PRODUCTS[1].src,
    width: HERO_PRODUCTS[1].width,
    height: HERO_PRODUCTS[1].height,
    className: "right-[3%] top-[5%] w-[42px] rotate-[10deg] sm:right-[10%] sm:top-[6%] sm:w-[54px]",
    productOpacity: "0.62",
  },
  {
    id: "hero-product-3",
    src: HERO_PRODUCTS[2].src,
    width: HERO_PRODUCTS[2].width,
    height: HERO_PRODUCTS[2].height,
    className: "left-[2%] bottom-[8%] w-[50px] rotate-[8deg] sm:left-[9%] sm:bottom-[9%] sm:w-[62px]",
    productOpacity: "0.66",
  },
  {
    id: "hero-product-4",
    src: HERO_PRODUCTS[3].src,
    width: HERO_PRODUCTS[3].width,
    height: HERO_PRODUCTS[3].height,
    className: "right-[1%] bottom-[10%] w-[52px] -rotate-[7deg] sm:right-[8%] sm:bottom-[11%] sm:w-[62px]",
    productOpacity: "0.64",
  },
];

export default function SprabyHero() {
  return (
    <section className="relative isolate overflow-hidden pt-10 pb-10 text-center sm:pb-14 lg:pb-16">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-purple-200/70 to-transparent" />

      <div className="relative mx-auto max-w-5xl">
        <div className="relative mx-auto flex min-h-[168px] max-w-4xl flex-col items-center justify-center sm:min-h-[214px] md:min-h-[292px] lg:min-h-[314px]">
          <div className="spraby-hero-mobile-products pointer-events-none absolute inset-0 z-0 md:hidden" aria-hidden="true">
            {HERO_MOBILE_PRODUCTS.map(product => (
              <HeroMobileProduct key={product.id} {...product} />
            ))}
          </div>

          <div className="spraby-hero-desktop-products pointer-events-none absolute inset-0 z-0 hidden md:block" aria-hidden="true">
            {HERO_PRODUCTS.map(product => (
              <HeroProduct key={product.id} {...product} />
            ))}
          </div>

          <div className="spraby-hero-logo relative z-10 flex items-center justify-center">
            <Image
              src={HERO_LOGO.src}
              alt="Spraby"
              width={HERO_LOGO.width}
              height={HERO_LOGO.height}
              priority
              quality={90}
              sizes="(max-width: 640px) 185px, (max-width: 1024px) 240px, 278px"
              className="h-auto w-[185px] drop-shadow-[0_18px_34px_rgba(124,58,237,0.13)] sm:w-[240px] lg:w-[278px]"
            />
          </div>

          {HERO_TAGS.map(tag => (
            <div key={tag.id} className={tag.desktopClassName}>
              <HeroTag appearDelay={tag.appearDelay} floatDelay={tag.floatDelay}>
                {tag.content}
              </HeroTag>
            </div>
          ))}
        </div>

        <div className="spraby-hero-mobile-tags mx-auto mt-2 flex max-w-[360px] flex-wrap justify-center gap-2.5 md:hidden">
          {HERO_TAGS.map(tag => (
            <HeroTag key={tag.id} appearDelay={tag.appearDelay} floatDelay={tag.floatDelay}>
              {tag.content}
            </HeroTag>
          ))}
        </div>

        <h1 className="spraby-hero-title mx-auto mt-8 max-w-4xl text-[2.45rem] font-semibold leading-[1.06] tracking-normal text-slate-900 [text-wrap:balance] sm:mt-10 sm:text-5xl lg:text-[4rem]">
          <span className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Маркетплейс
          </span>{" "}
          авторских товаров
        </h1>

        <p className="spraby-hero-copy mx-auto mt-5 max-w-[660px] text-base leading-7 text-slate-500 sm:text-lg">
          Объединяем мастеров, локальные бренды и покупателей
        </p>

        <div className="spraby-hero-action mt-8 flex justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-purple-600 px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_-20px_rgba(124,58,237,0.95)] transition duration-200 hover:-translate-y-0.5 hover:bg-purple-700 hover:shadow-[0_20px_38px_-22px_rgba(124,58,237,0.95)] active:translate-y-0 active:scale-[0.98] sm:px-8 sm:py-3.5 sm:text-base"
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>

    </section>
  );
}

type HeroTagProps = {
  children: ReactNode
  appearDelay: string
  floatDelay: string
}

const HeroTag = ({children, appearDelay, floatDelay}: HeroTagProps) => (
  <div
    className="spraby-hero-tag-shell inline-flex"
    style={{
      opacity: 0,
      "--appear-delay": appearDelay,
      "--float-delay": floatDelay,
    } as CSSVariables}
  >
    <span
      className="spraby-hero-tag inline-flex items-center gap-1 rounded-2xl border border-white/70 bg-[rgba(255,255,255,0.65)] px-3.5 py-2.5 text-[13px] font-semibold leading-none text-slate-700 shadow-[0_12px_40px_rgba(30,41,59,0.08)] backdrop-blur-[18px] sm:text-sm"
    >
      {children}
    </span>
  </div>
);

const HeroProduct = ({
  src,
  width,
  height,
  className,
  appearDelay,
  floatDelay,
  floatX,
  floatY,
  productOpacity,
}: HeroProductConfig) => (
  <div
    className={`spraby-hero-product-shell absolute ${className}`}
    style={{
      aspectRatio: `${width} / ${height}`,
      "--appear-delay": appearDelay,
      "--float-delay": floatDelay,
      "--float-x": floatX,
      "--float-y": floatY,
      "--product-opacity": productOpacity,
    } as CSSVariables}
  >
    <div className="spraby-hero-product-float">
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        sizes="(max-width: 1024px) 70px, 90px"
        className="spraby-hero-product-art"
      />
    </div>
  </div>
);

const HeroMobileProduct = ({
  src,
  width,
  height,
  className,
  productOpacity,
}: HeroMobileProductConfig) => (
  <div
    className={`absolute ${className}`}
    style={{opacity: productOpacity, aspectRatio: `${width} / ${height}`} as CSSProperties}
  >
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      sizes="70px"
      className="spraby-hero-product-art"
    />
  </div>
);
