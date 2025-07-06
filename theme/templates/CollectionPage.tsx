'use client'

import ProductCart from "@/theme/snippents/ProductCart";
import FilterPanel from "@/theme/snippents/FilterPanel";
import {BreadcrumbItem, FilterItem} from "@/types";
import {getFilteredProducts} from "@/services/Products";
import {useState} from "react";
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

  const onChange = async (params: any) => {
    setLoading(true);
    const data: any = await convertSearchParamsToQueryParams(params, filter);

    const products = await getFilteredProducts({
      options: Object.entries(data).map(([optionId, values]: any) => ({optionId, values})),
      ...(!!collection?.handle ? {collectionHandles: [collection.handle]} : {}),
      ...(!!category?.handle ? {categoryHandles: [category.handle]} : {})
    })

    setProducts(products);
    setLoading(false);
  }

  return <main className='container mx-auto pt-5'>
    {
      !!breadcrumbs?.length &&
      <nav aria-label="breadcrumb">
        <ol className="flex items-center gap-1 text-sm font-medium text-gray-500 py-3">
          {
            breadcrumbs.map((i: BreadcrumbItem, index: number) => {
              return <>
                <li key={index} className={'flex gap-1 items-center'}>
                  {
                    (!!breadcrumbs?.length && breadcrumbs?.length > index + 1) ?
                      <>
                        <a href={i.url} className="text-gray-600 hover:underline">
                          {i.title}
                        </a>
                        <MdArrowForwardIos/>
                      </> :
                      <span className="text-gray-600 font-bold">
                      {i.title}
                    </span>
                  }
                </li>
              </>
            })
          }
        </ol>
      </nav>
    }
    {
      (!!collection || !!category) &&
      <h1 className={'text-left text-2xl font-bold'}>{collection?.title ?? (category?.title ?? '')}</h1>
    }
    <div className='grid grid-cols-12 gap-5 pt-10'>
      {
        loading &&
        <div className={'cover-fixed z-50'}>
          <div className={'w-full h-full bg-black opacity-15 cover-absolute'}/>
          <Spin size={'large'} className={'absolute top-1/2 left-1/2'}/>
        </div>
      }
      <div className='col-span-3'>
        {
          <FilterPanel options={filter} searchParams={searchParams} onChange={onChange}/>
        }
      </div>
      <div className='col-span-9'>
        <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5'>
          {
            products.map((product: any, index: number) => {
              return <ProductCart product={product} key={index}/>;
            })
          }
        </div>
      </div>
    </div>
  </main>
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
