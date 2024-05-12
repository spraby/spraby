'use client'

import ProductCart from "@/theme/snippents/ProductCart";
import FilterPanel from "@/theme/snippents/FilterPanel";
import {FilterItem} from "@/types";
import {getFilteredProducts} from "@/services/Products";
import {useEffect, useState} from "react";
import {ProductModel} from "@/prisma/types";
import {Spin} from "antd";
import {getOptions as getCollectionOptions} from "@/services/Collections";
import {getOptions as getCategoriesOptions} from "@/services/Categories";
import {convertOptionsToFilter} from "@/services/Options";

export default function CollectionPage({
                                         searchParams,
                                         loading: defaultLoading = false,
                                         collectionHandle,
                                         categoryHandle
                                       }: Props) {
  const [loading, setLoading] = useState(defaultLoading);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [filter, setFilter] = useState<FilterItem[]>([])

  useEffect(() => {
    (async function () {
      const options = collectionHandle ? await getCollectionOptions({handle: collectionHandle}) : (categoryHandle ? await getCategoriesOptions({handle: categoryHandle}) : [])
      const filter = await convertOptionsToFilter(options)
      setFilter(filter);
    })().then();
  }, [])

  const onChange = async (params: any) => {
    setLoading(true);
    const data: any = {}

    Object.entries(params).map(([key, value]: any) => {
      const values = value.split(',').map((i: string) => i.trim())
      const filterItem = filter.find(i => i.key === key);

      if (filterItem) {
        values.map((value: string) => {
          const filterValue = filterItem.values.find(i => value === i.value);
          if (filterValue) {
            filterValue.optionIds.map((id: string) => {
              if (!data[id]) data[id] = [];
              data[id] = Array.from(new Set([...data[id], filterValue.value]))
            })
          }
        })
      }
    })

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
  searchParams?: any,
  loading?: boolean,
  collectionHandle?: string
  categoryHandle?: string
}
