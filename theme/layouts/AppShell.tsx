'use client'

import {usePathname} from "next/navigation";
import {CSSProperties, ReactNode, useEffect} from "react";
import Image from "next/image";
import ThemeLayout from "@/theme/layouts/ThemeLayout";
import {MenuItem} from "@/types";

const AUTH_PATHS = new Set(["/register"]);

type CSSVariables = CSSProperties & Record<`--${string}`, string>;

// Парящие товары и плашки вокруг формы — тот же набор и движение, что в герое
// главной (theme/sections/SprabyHero.tsx). Только там, где сбоку от формы есть место.
const FLOATING_PRODUCTS = [
  {src: "/img/hero/hero-product-3.webp", width: 170, height: 192, className: "left-[7%] top-[9%] w-[96px]", rotate: "-rotate-[13deg]", appearDelay: "200ms", floatDelay: "700ms", floatX: "4px", floatY: "-10px"},
  {src: "/img/hero/hero-product-5.webp", width: 192, height: 190, className: "left-[3%] top-[47%] w-[72px]", rotate: "rotate-[13deg]", appearDelay: "350ms", floatDelay: "1750ms", floatX: "-4px", floatY: "-12px"},
  {src: "/img/hero/hero-product-2.webp", width: 138, height: 192, className: "left-[11%] bottom-[7%] w-[70px]", rotate: "rotate-[16deg]", appearDelay: "500ms", floatDelay: "400ms", floatX: "5px", floatY: "-10px"},
  {src: "/img/hero/hero-product-6.webp", width: 185, height: 192, className: "right-[9%] top-[7%] w-[84px]", rotate: "rotate-[9deg]", appearDelay: "250ms", floatDelay: "950ms", floatX: "3px", floatY: "-9px"},
  {src: "/img/hero/hero-product-4.webp", width: 182, height: 192, className: "right-[3%] top-[44%] w-[100px]", rotate: "rotate-[11deg]", appearDelay: "400ms", floatDelay: "1500ms", floatX: "-5px", floatY: "-8px"},
  {src: "/img/hero/hero-product-1.webp", width: 192, height: 189, className: "right-[10%] bottom-[8%] w-[80px]", rotate: "-rotate-[9deg]", appearDelay: "550ms", floatDelay: "1100ms", floatX: "-4px", floatY: "-10px"},
];

const FLOATING_TAGS = [
  {lead: "Made in ", accent: "Belarus", accentClassName: "text-purple-600", className: "left-[13%] top-[28%]", rotate: "-rotate-[3deg]", appearDelay: "700ms", floatDelay: "900ms"},
  {lead: "Limited ", accent: "edition", accentClassName: "text-amber-600", className: "left-[9%] top-[70%]", rotate: "rotate-[2deg]", appearDelay: "850ms", floatDelay: "1350ms"},
  {lead: "Handmade with ", accent: "love", accentClassName: "text-rose-500", className: "right-[12%] top-[26%]", rotate: "rotate-[3deg]", appearDelay: "800ms", floatDelay: "1200ms"},
  {lead: "Local ", accent: "brands", accentClassName: "text-indigo-600", className: "right-[13%] top-[68%]", rotate: "-rotate-[2deg]", appearDelay: "950ms", floatDelay: "1500ms"},
];

const FloatingDecor = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
    {FLOATING_PRODUCTS.map((item) => (
      <div
        key={item.src}
        className={`auth-floater auth-floater-product ${item.className}`}
        style={{"--appear-delay": item.appearDelay} as CSSVariables}
      >
        <div
          className="auth-floater-motion"
          style={{"--float-delay": item.floatDelay, "--float-x": item.floatX, "--float-y": item.floatY} as CSSVariables}
        >
          <Image src={item.src} alt="" width={item.width} height={item.height} sizes="100px" className={`auth-floater-art ${item.rotate}`}/>
        </div>
      </div>
    ))}

    {FLOATING_TAGS.map((tag) => (
      <div
        key={tag.accent}
        className={`auth-floater ${tag.className}`}
        style={{"--appear-delay": tag.appearDelay} as CSSVariables}
      >
        <span
          className="auth-floater-motion inline-flex items-center gap-1 rounded-2xl border border-white/70 bg-white/80 px-3.5 py-2.5 text-sm font-semibold leading-none text-slate-700 shadow-[0_12px_40px_rgba(46,16,101,0.25)] backdrop-blur-[18px]"
          style={{"--float-delay": tag.floatDelay, "--float-duration": "5800ms", "--float-y": "-7px", "--float-x": "0px"} as CSSVariables}
        >
          <span className={`inline-flex items-center gap-1 ${tag.rotate}`}>
            {tag.lead}
            <span className={tag.accentClassName}>{tag.accent}</span>
          </span>
        </span>
      </div>
    ))}
  </div>
);

export default function AppShell({children, menu}: { children: ReactNode, menu: MenuItem[] }) {
  const pathname = usePathname();
  const isAuth = pathname ? AUTH_PATHS.has(pathname) : false;

  // Скроллим вверх при каждой смене маршрута
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isAuth) {
    return (
      // Тот же «живой» фиолетовый фон, что и у входа в кабинет продавца
      // (api: components/storefront-auth.tsx). Ширину и отступы задаёт сама страница.
      <div className="auth-bg relative flex min-h-screen items-start justify-center overflow-hidden sm:items-center">
        <div aria-hidden className="auth-glow -left-32 -top-32 h-[28rem] w-[28rem] bg-fuchsia-400"/>
        <div
          aria-hidden
          className="auth-glow -bottom-40 -right-40 h-[32rem] w-[32rem] bg-indigo-500"
          style={{animationDelay: "-11s"}}
        />
        <FloatingDecor/>
        {/* Сквозь пустые поля страницы мышь доходит до парящих товаров; сама форма кликабельна. */}
        <div className="pointer-events-none relative w-full">{children}</div>
      </div>
    );
  }

  return <ThemeLayout menu={menu}>{children}</ThemeLayout>;
}
