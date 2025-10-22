'use client'

import ProductCart from "@/theme/snippents/ProductCart";
import ResponsiveFilters from "@/theme/snippents/ResponsiveFilters";
import {BreadcrumbItem, FilterItem} from "@/types";
import {getFilteredProducts} from "@/services/Products";
import {useCallback, useEffect, useMemo, useState} from "react";
import {CategoryModel, CollectionModel, ProductModel} from "@/prisma/types";
import {Spin} from "antd";
import {convertSearchParamsToQueryParams} from "@/services/Options";
import type {ProductSort} from "@/types";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  {value: 'newest', label: 'Актуальности'},
  {value: 'price_asc', label: 'Цене: сначала низкая'},
  {value: 'price_desc', label: 'Цене: сначала высокая'},
  {value: 'oldest', label: 'Дате добавления'},
];

const toSearchRecord = (params?: Record<string, any>): Record<string, string> => {
  if (!params) return {};
  return Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    acc[key] = Array.isArray(value) ? value.join(',') : String(value);
    return acc;
  }, {});
};

const getResultsWord = (count: number) => {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'результатов';
  if (mod10 === 1) return 'результат';
  if (mod10 >= 2 && mod10 <= 4) return 'результата';
  return 'результатов';
};

export default function CollectionPage({
                                         collection,
                                         breadcrumbs,
                                         category,
                                         searchParams,
                                         products: defaultProducts,
                                         filter,
                                         loading: defaultLoading,
                                       }: Props) {
  const [loading, setLoading] = useState(defaultLoading);
  const [products, setProducts] = useState<ProductModel[]>(defaultProducts);
  const [sort, setSort] = useState<ProductSort>('newest');
  const [activeParams, setActiveParams] = useState<Record<string, string>>(() => toSearchRecord(searchParams));
  const pageTitle = collection?.header ?? category?.header ?? '';

  useEffect(() => {
    setActiveParams(toSearchRecord(searchParams));
  }, [searchParams]);

  const fetchProducts = useCallback(async (params: Record<string, string>, sortValue: ProductSort) => {
    setLoading(true);
    try {
      const data: any = await convertSearchParamsToQueryParams(params, filter);
      const productsResponse = await getFilteredProducts({
        options: Object.entries(data).map(([optionId, values]: any) => ({optionId, values})),
        ...(collection?.handle ? {collectionHandles: [collection.handle]} : {}),
        ...(category?.handle ? {categoryHandles: [category.handle]} : {}),
        sort: sortValue,
      });
      setProducts(productsResponse);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  }, [filter, collection?.handle, category?.handle]);

  const handleFiltersChange = useCallback(async (params: Record<string, string>) => {
    setActiveParams(params);
    await fetchProducts(params, sort);
  }, [fetchProducts, sort]);

  const handleSortChange = useCallback((value: ProductSort) => {
    setSort(value);
    void fetchProducts(activeParams, value);
  }, [activeParams, fetchProducts]);

  const headerTitle = pageTitle || collection?.name || category?.title || 'Каталог';
  const formattedCount = useMemo(() => new Intl.NumberFormat('ru-RU').format(products.length), [products.length]);
  const resultsWord = useMemo(() => getResultsWord(products.length), [products.length]);
  const sortControl = (
    <div className='relative inline-flex items-center'>
      <select
        value={sort}
        onChange={(event) => handleSortChange(event.target.value as ProductSort)}
        className='appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-sm font-semibold text-gray-800 focus:outline-none'
        aria-label='Выбор сортировки'
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400'>
        <ChevronDownMiniIcon/>
      </span>
    </div>
  );

  return (
    <main className='px-4 pt-5 pb-10 sm:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-6xl flex-col gap-4 lg:gap-6'>
        {
          !!breadcrumbs?.length &&
          <nav aria-label="breadcrumb" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <ol className="flex items-center gap-1.5 whitespace-nowrap pr-5 pe-8 text-sm font-medium text-gray-500 lg:pr-0 lg:pe-0">
              {
                breadcrumbs.map((i: BreadcrumbItem, index: number) => (
                  <li key={index} className='flex items-center'>
                    {
                      (!!breadcrumbs?.length && breadcrumbs?.length > index + 1) ?
                        <>
                          <a href={i.url} className="inline-flex items-center gap-1 text-gray-600 transition hover:text-purple-600">
                            {i.title}
                          </a>
                          <BreadcrumbSeparatorIcon/>
                        </> :
                        <span className="text-gray-800 font-semibold">
                      {i.title}
                    </span>
                    }
                  </li>
                ))
              }
            </ol>
          </nav>
        }
        {pageTitle && (
          <h1 className='text-left text-2xl font-bold text-gray-900 sm:text-3xl'>
            {pageTitle}
          </h1>
        )}

        <div className='hidden lg:grid lg:grid-cols-[minmax(230px,260px)_minmax(0,1fr)] lg:items-start lg:gap-8 lg:pt-1'>
          <div className='flex items-start'>
            <h2 className='text-lg font-semibold text-gray-900'>{headerTitle}</h2>
          </div>
          <div className='flex items-start justify-end'>
            <div className='flex flex-col items-end gap-2 text-sm'>
              <span className='font-semibold text-purple-600'>
                {formattedCount} {resultsWord}
              </span>
              <div className='flex items-center gap-3 text-gray-500'>
                <span className='font-medium'>Сортировка по:</span>
                {sortControl}
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(230px,260px)_minmax(0,1fr)] lg:items-start lg:gap-8'>
          <ResponsiveFilters
            options={filter}
            searchParams={searchParams}
            onChange={handleFiltersChange}
            title={pageTitle}
          />

          <section className='flex-1'>
            <div className='relative'>
              {
                loading &&
                <div className='cover-fixed z-40'>
                  <div className='cover-absolute h-full w-full bg-black/10 backdrop-blur-[1px]'/>
                  <Spin size='large' className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'/>
                </div>
              }

              <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-3 sm:items-end sm:self-end lg:hidden'>
                  <div className='text-right text-sm font-semibold text-purple-600 sm:text-base'>
                    {formattedCount} {resultsWord}
                  </div>
                  <div className='flex items-center justify-end gap-3 text-sm text-gray-500'>
                    <span className='font-medium text-gray-500 whitespace-nowrap'>Сортировка по:</span>
                    <div className='min-w-[12rem] sm:w-auto'>
                      {sortControl}
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                  {
                    products.map((product: any, index: number) => {
                      return <ProductCart product={product} key={index}/>;
                    })
                  }
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

type Props = {
  category?: CategoryModel,
  collection?: CollectionModel,
  products: ProductModel[],
  filter: FilterItem[],
  searchParams?: any,
  loading?: boolean,
  breadcrumbs?: BreadcrumbItem[],
}

const ChevronDownMiniIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="M4.5 6.5L8 10l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BreadcrumbSeparatorIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="mx-2 h-3.5 w-3.5 text-gray-400" aria-hidden="true">
    <path d="M6 3.5L10 8l-4 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
