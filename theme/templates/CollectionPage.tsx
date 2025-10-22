'use client'

import ProductCart from "@/theme/snippents/ProductCart";
import ResponsiveFilters from "@/theme/snippents/ResponsiveFilters";
import {BreadcrumbItem, FilterItem} from "@/types";
import {getFilteredProducts} from "@/services/Products";
import {useCallback, useState} from "react";
import {CategoryModel, CollectionModel, ProductModel} from "@/prisma/types";
import {Spin} from "antd";
import {convertSearchParamsToQueryParams} from "@/services/Options";
import {MdArrowForwardIos} from "react-icons/md";

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
  const pageTitle = collection?.header ?? category?.header ?? '';

  const onChange = useCallback(async (params: any) => {
    setLoading(true);
    const data: any = await convertSearchParamsToQueryParams(params, filter);

    const products = await getFilteredProducts({
      options: Object.entries(data).map(([optionId, values]: any) => ({optionId, values})),
      ...(!!collection?.handle ? {collectionHandles: [collection.handle]} : {}),
      ...(!!category?.handle ? {categoryHandles: [category.handle]} : {})
    })

    setProducts(products);
    setLoading(false);
  }, [filter, collection?.handle, category?.handle]);

  return (
    <main className='px-4 pt-5 pb-10 sm:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-6xl flex-col gap-4 lg:gap-6'>
        {
          !!breadcrumbs?.length &&
          <nav aria-label="breadcrumb">
            <ol className="flex items-center gap-1 text-sm font-medium text-gray-500">
              {
                breadcrumbs.map((i: BreadcrumbItem, index: number) => (
                  <li key={index} className='flex items-center gap-1'>
                    {
                      (!!breadcrumbs?.length && breadcrumbs?.length > index + 1) ?
                        <>
                          <a href={i.url} className="text-gray-600 hover:underline">
                            {i.title}
                          </a>
                          <MdArrowForwardIos className='text-xs text-gray-400'/>
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

        <div className='flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(230px,260px)_minmax(0,1fr)] lg:items-start lg:gap-8'>
          <ResponsiveFilters
            options={filter}
            searchParams={searchParams}
            onChange={onChange}
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

              <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {
                  products.map((product: any, index: number) => {
                    return <ProductCart product={product} key={index}/>;
                  })
                }
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
