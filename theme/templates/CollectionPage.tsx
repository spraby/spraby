'use client'

import ProductCart from "@/theme/snippents/ProductCart";
import FilterPanel from "@/theme/snippents/FilterPanel";
import {FilterItem} from "@/types";
import {findMany} from "@/services/Products";
import {useEffect, useState} from "react";
import {findFirst} from "@/services/Collections";
import {CollectionModel} from "@/prisma/types";

export default function CollectionPage({filter = [], searchParams, loading = false, handle}: Props) {
  const [products, setProducts] = useState<any>([]);
  const [collection, setCollection] = useState<CollectionModel | null>();

  useEffect(() => {
    findFirst({
      where: {handle},
      include: {Categories: true}
    }).then(setCollection)
  }, [handle]);

  const onChange = async (params: any) => {
    if (!collection) return;

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
    const result = Object.entries(data).map(([optionId, values]: any) => ({optionId, values}))

    const products = await findMany({
      where: {
        Category: {
          handle: {
            in: (collection.Categories ?? []).map(i => i.handle)
          }
        },
        ...(result?.length ? {
          Category: {
            Options: {
              every: {
                id: {
                  in: result.map(i => i.optionId)
                }
              }
            }
          },
          Variants: {
            some: {
              Values: {
                some: {
                  AND: result.map(i => (
                      {
                        Value: {
                          optionId: i.optionId,
                          value: {
                            in: i.values
                          }
                        }
                      }
                    )
                  )
                }
              }
            }
          }
        } : {})
      },
      include: {
        Images: {
          include: {
            Image: true
          }
        }
      }
    })

    setProducts(products.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: '220.00',
      discountPrice: '200.00 BYN',
      handle: p.id,
      options: [],
      variants: [],
      images: p.Images?.map(i => ({
        id: i.Image?.id,
        src: i.Image?.src
      }))
    })));
  }

  return collection && <main className='container mx-auto grid grid-cols-12 gap-5 pt-10'>
    <div className='col-span-3'>
      {
        !loading && <FilterPanel options={filter} searchParams={searchParams} onChange={onChange}/>
      }
    </div>
    <div className='col-span-9'>
      <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5'>
        {
          !loading && products.map((product: any, index: number) => {
            return <ProductCart product={product} key={index}/>;
          })
        }
      </div>
    </div>
  </main>
}

type Props = {
  searchParams?: any,
  filter?: FilterItem[]
  loading?: boolean,
  handle: string
}
