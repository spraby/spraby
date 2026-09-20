'use client'

import Image from 'next/image';
import Link from 'next/link';
import {FaFacebookF, FaInstagram, FaTelegramPlane, FaWhatsapp} from 'react-icons/fa';
import {FiMail, FiPhone} from 'react-icons/fi';
import {useCallback, useEffect, useMemo, useState} from "react";

import {BRAND_PAGE_SIZE} from "@/lib/brand-page";
import {
  getSocialDisplayValue,
  normalizeEmailHref,
  normalizePhoneHref,
  normalizeSocialUrl,
  SOCIAL_CONTACT_TYPES,
  SOCIAL_LABELS,
} from "@/lib/contacts";
import {BrandModel, ProductCardModel} from "@/prisma/types";
import {getFilteredProducts} from "@/services/Products";

import type {IconType} from 'react-icons';
import ProductCart from "@/theme/snippents/ProductCart";

/** Порядок вывода: сначала то, чем реально связываются. */
const CONTACT_ORDER = ['phone', 'whatsapp', 'telegram', 'email', 'instagram', 'facebook'];

const CONTACT_ICONS: Record<string, IconType> = {
  phone: FiPhone,
  email: FiMail,
  whatsapp: FaWhatsapp,
  telegram: FaTelegramPlane,
  instagram: FaInstagram,
  facebook: FaFacebookF,
};

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const getProductsWord = (count: number) => {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'товаров';
  if (mod10 === 1) return 'товар';
  if (mod10 >= 2 && mod10 <= 4) return 'товара';
  return 'товаров';
};

const getInitials = (name: string) => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase();

export type BrandPageContact = {
  type: string,
  value: string,
}

export type BrandPageCategory = {
  id: string,
  title: string,
  handle: string,
}

type Props = {
  brand: BrandModel,
  /** Абсолютный адрес логотипа: собирается на сервере, в браузере домена S3 нет. */
  logoUrl?: string | null,
  categories?: BrandPageCategory[],
  contacts?: BrandPageContact[],
  products: ProductCardModel[],
  total?: number,
  pageSize?: number,
  /** Страница открыта по ссылке превью и ещё не опубликована. */
  isPreview?: boolean,
}

export default function BrandPage({
                                    brand,
                                    logoUrl,
                                    categories = [],
                                    contacts = [],
                                    products: defaultProducts,
                                    total: defaultTotal = defaultProducts.length,
                                    pageSize = BRAND_PAGE_SIZE,
                                    isPreview = false,
                                  }: Props) {
  const [products, setProducts] = useState<ProductCardModel[]>(defaultProducts);
  const [total, setTotal] = useState<number>(defaultTotal);
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  const normalizedPageSize = pageSize > 0 ? pageSize : BRAND_PAGE_SIZE;
  const hasMore = products.length < total;

  // Бренд может смениться при клиентской навигации между страницами брендов.
  useEffect(() => {
    setProducts(defaultProducts);
    setTotal(defaultTotal);
    setPage(1);
    setIsAboutExpanded(false);
  }, [defaultProducts, defaultTotal]);

  const loadMoreProducts = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const response = await getFilteredProducts({
        brandId: Number(brand.id),
        limit: normalizedPageSize,
        page: nextPage,
      });
      setProducts((prev) => [...prev, ...response.items]);
      setTotal(response.total);
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more brand products', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [brand.id, hasMore, isLoadingMore, normalizedPageSize, page]);

  const formattedTotal = useMemo(() => new Intl.NumberFormat('ru-RU').format(total), [total]);
  const formattedLoaded = useMemo(() => new Intl.NumberFormat('ru-RU').format(products.length), [products.length]);
  const about = useMemo(() => htmlToText(brand.about), [brand.about]);
  const refundPolicy = useMemo(() => htmlToText(brand.refund_policy), [brand.refund_policy]);
  const publishedAt = useMemo(() => formatDate(brand.page_published_at ?? brand.created_at), [brand.page_published_at, brand.created_at]);
  const isAboutLong = about.length > 320;

  // Значения продавец вводит как угодно — ссылку собираем по типу контакта.
  const contactLinks = useMemo(() => contacts
    .filter((contact) => contact.value?.trim())
    .map((contact) => {
      if (contact.type === 'phone') {
        return {type: contact.type, label: 'Телефон', display: contact.value, url: normalizePhoneHref(contact.value), external: false};
      }

      if (contact.type === 'email') {
        return {type: contact.type, label: 'Email', display: contact.value, url: normalizeEmailHref(contact.value), external: false};
      }

      if (!SOCIAL_CONTACT_TYPES.includes(contact.type)) {
        return null;
      }

      const url = normalizeSocialUrl(contact.type, contact.value);

      return url
        ? {
          type: contact.type,
          label: SOCIAL_LABELS[contact.type] ?? contact.type,
          display: getSocialDisplayValue(contact.type, contact.value) || contact.value,
          url,
          external: true,
        }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => CONTACT_ORDER.indexOf(a!.type) - CONTACT_ORDER.indexOf(b!.type)) as { type: string, label: string, display: string, url: string, external: boolean }[],
  [contacts]);

  return (
    <main className='pb-12'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8'>
        {isPreview && (
          <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
            <EyeIcon/>
            <span>Предпросмотр: страница ещё не опубликована и видна только по ссылке из админки.</span>
          </div>
        )}

        <nav aria-label='breadcrumb' className='text-sm font-medium text-gray-500'>
          <ol className='flex items-center gap-1.5'>
            <li className='flex items-center'>
              <Link href='/' className='text-gray-600 transition hover:text-purple-600'>Главная</Link>
              <ChevronRightIcon/>
            </li>
            <li className='truncate font-semibold text-gray-800'>{brand.name}</li>
          </ol>
        </nav>

        {/* Обложка: у бренда своей картинки нет, поэтому строим фон из акцента площадки */}
        <section className='overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-sm'>
          <div className='relative h-28 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600 sm:h-40'>
            <div className='absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:20px_20px]'/>
            <div className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent'/>
          </div>

          <div className='flex flex-col gap-4 px-5 pb-5 sm:px-8 sm:pb-7'>
            <div className='flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-6'>
              <div className='relative -mt-12 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-2xl font-semibold uppercase text-gray-500 ring-4 ring-white sm:-mt-16 sm:h-32 sm:w-32 sm:rounded-3xl'>
                {logoUrl ? (
                  <Image
                    fill
                    priority
                    className='object-cover object-center'
                    sizes='(max-width: 640px) 96px, 128px'
                    src={logoUrl}
                    alt={brand.name}
                  />
                ) : getInitials(brand.name)}
              </div>

              <div className='flex min-w-0 flex-1 flex-col items-center gap-2 text-center sm:items-start sm:pb-1 sm:text-left'>
                <h1 className='text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl'>{brand.name}</h1>
                <div className='flex flex-wrap items-center justify-center gap-2 sm:justify-start'>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700'>
                    <BagIcon/>
                    {formattedTotal} {getProductsWord(total)}
                  </span>
                  {publishedAt && (
                    <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600'>
                      <CalendarIcon/>
                      на spraby с {publishedAt}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {categories.length > 0 && (
              <div className='flex flex-wrap justify-center gap-2 sm:justify-start'>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    className='inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700'
                  >
                    {category.title}
                  </Link>
                ))}
              </div>
            )}

            {contactLinks.length > 0 && (
              <div className='flex flex-wrap justify-center gap-2 sm:justify-start'>
                {contactLinks.map((contact) => (
                  <a
                    key={`${contact.type}-${contact.display}`}
                    href={contact.url}
                    title={contact.label}
                    {...(contact.external ? {target: '_blank', rel: 'noopener noreferrer nofollow'} : {})}
                    className='inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700'
                  >
                    <ContactIcon type={contact.type}/>
                    <span className='truncate'>{contact.display}</span>
                  </a>
                ))}
              </div>
            )}

            {about && (
              <div className='flex flex-col items-start gap-1 border-t border-gray-100 pt-4'>
                <p className={`max-w-3xl whitespace-pre-line text-sm leading-6 text-gray-600 ${isAboutExpanded || !isAboutLong ? '' : 'line-clamp-4'}`}>
                  {about}
                </p>
                {isAboutLong && (
                  <button
                    type='button'
                    onClick={() => setIsAboutExpanded((prev) => !prev)}
                    className='text-sm font-semibold text-purple-600 transition hover:text-purple-700'
                  >
                    {isAboutExpanded ? 'Свернуть' : 'Читать полностью'}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <section className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-baseline justify-between gap-2'>
            <h2 className='text-lg font-semibold text-gray-900 sm:text-xl'>Товары бренда</h2>
            {total > 0 && (
              <span className='text-xs font-medium text-gray-400'>
                Показано {formattedLoaded} из {formattedTotal}
              </span>
            )}
          </div>

          {products.length > 0 ? (
            <div className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4'>
              {products.map((product) => (
                <ProductCart product={product} key={String(product.id)}/>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white py-14 text-center'>
              <BagIcon className='h-6 w-6 text-gray-300'/>
              <p className='text-sm font-semibold text-gray-600'>Пока нет товаров</p>
              <p className='max-w-xs text-xs text-gray-400'>Бренд ещё не выложил ни одного товара — загляните позже.</p>
            </div>
          )}

          {hasMore && (
            <button
              type='button'
              disabled={isLoadingMore}
              onClick={() => void loadMoreProducts()}
              className='mx-auto w-full rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[16rem]'
            >
              {isLoadingMore ? 'Загружаем…' : `Показать ещё ${Math.min(normalizedPageSize, total - products.length)}`}
            </button>
          )}
        </section>

        {refundPolicy && (
          <details className='group rounded-2xl border border-gray-200/70 bg-white p-5 sm:p-6'>
            <summary className='flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-gray-900'>
              Условия возврата
              <ChevronDownIcon/>
            </summary>
            <p className='whitespace-pre-line pt-3 text-sm leading-6 text-gray-600'>{refundPolicy}</p>
          </details>
        )}
      </div>
    </main>
  );
}

/** Убираем разметку из текста редактора, сохраняя переносы между блоками. */
function htmlToText(html?: string | null): string {
  if (!html) return '';

  return html
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatDate(value?: Date | string | null): string {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

const ChevronRightIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="mx-2 h-3.5 w-3.5 text-gray-400" aria-hidden="true">
    <path d="M6 3.5L10 8l-4 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180" aria-hidden="true">
    <path d="M4.5 6.5L8 10l3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BagIcon = ({className = 'h-4 w-4'}: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M6 7h12l-1 13H7L6 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M9 7a3 3 0 1 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    <rect x="4" y="6" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M4 10h16M9 4v3m6-3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const ContactIcon = ({type}: { type: string }) => {
  const Icon = CONTACT_ICONS[type];

  return Icon ? <Icon className='h-4 w-4 shrink-0 text-gray-400' aria-hidden='true'/> : null;
};

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);
