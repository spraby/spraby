'use client'

import ProductCart from "@/theme/snippents/ProductCart";
import FilterPanel from "@/theme/snippents/FilterPanel";
import {FilterItem} from "@/types";
import {getFilteredProducts} from "@/services/Products";
import {useState} from "react";
import {ProductModel} from "@/prisma/types";
import {Spin} from "antd";
import {convertSearchParamsToQueryParams} from "@/services/Options";

export default function CollectionPage({
                                         searchParams,
                                         products: defaultProducts,
                                         filter,
                                         loading: defaultLoading,
                                         collectionHandle,
                                         categoryHandle
                                       }: Props) {
  const [loading, setLoading] = useState(defaultLoading);
  const [products, setProducts] = useState<ProductModel[]>(defaultProducts);

  const onChange = async (params: any) => {
    setLoading(true);
    const data: any = await convertSearchParamsToQueryParams(params, filter);

    const products = await getFilteredProducts({
      options: Object.entries(data).map(([optionId, values]: any) => ({optionId, values})),
      ...(collectionHandle ? {collectionHandles: [collectionHandle]} : {}),
      ...(categoryHandle ? {categoryHandles: [categoryHandle]} : {})
    })

    setProducts(products);
    setLoading(false);
  }

  return <main className='container mx-auto grid grid-cols-12 gap-5 pt-10'>
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
  </main>
}

type Props = {
  products: ProductModel[],
  filter: FilterItem[],
  searchParams?: any,
  loading?: boolean,
  collectionHandle?: string,
  categoryHandle?: string
}
