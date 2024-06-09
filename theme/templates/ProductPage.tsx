'use client'

import DoubleSlider from "@/theme/snippents/DoubleSlider";
import Tabs from "@/theme/snippents/Tabs";
import Accordion from "@/theme/snippents/Accordion";
import VariantSelector from "@/theme/snippents/VariantSelector";
import {useMemo, useState} from "react";
import {ProductModel, VariantModel} from "@/prisma/types";

export default function ProductPage({product}: Props) {
  const [variant, setVariant] = useState<VariantModel>()
  const [startImage, setStartImage] = useState<string | null>(null);

  const options = useMemo(() => {
    if (product && product?.Category && product?.Variants?.length) {
      return product.Category.Options?.reduce((acc: Options[], option) => {
        const optionVariantValues = (product?.Variants ?? []).reduce((acc: string[], variant) => {
          (variant.Values ?? []).map(value => {
            if (value.optionId === option.id && value.Value?.value && !acc.includes(value.Value.value)) acc.push(value.Value.value);
          });
          return acc;
        }, []);
        if (optionVariantValues?.length) acc.push({
          id: option.id,
          label: option.title,
          options: optionVariantValues.map(i => ({label: i, value: i}))
        })
        return acc;
      }, []);
    }

    return [];
  }, [product]);

  return !!product && <main className='pt-10'>
    <div className='container mx-auto grid gap-10 grid-cols-12'>
      <div className='flex gap-7 flex-col col-span-12 lg:col-span-6 xl:col-span-7'>
        <DoubleSlider images={(product.Images ?? []).map(i => i.Image?.src as string)} startImage={startImage}/>
        <Tabs
          tabs={[
            {
              label: 'Описание',
              value:
                '1 sdfbsdb Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod quos alias ipsam in eligendi blanditiis sint et, ratione nisi vero voluptates, amet mollitia perferendis nostrum minima atque sunt rerum at.',
            },
            {
              label: 'Характеристики',
              value:
                '2 sdvsdvfdsb Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod quos alias ipsam in eligendi blanditiis sint et, ratione nisi vero voluptates, amet mollitia perferendis nostrum minima atque sunt rerum at.',
            },
            {
              label: 'Способы доставки',
              value:
                '3 sdvssdcvsv Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod quos alias ipsam in eligendi blanditiis sint et, ratione nisi vero voluptates, amet mollitia perferendis nostrum minima atque sunt rerum at.',
            },
            {
              label: 'Условия возврата',
              value:
                '4 sdvssdcvcascsacsv Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod quos alias ipsam in eligendi blanditiis sint et, ratione nisi vero voluptates, amet mollitia perferendis nostrum minima atque sunt rerum at.',
            },
          ]}
        />
        <div className='h-px bg-gray-200'></div>
      </div>
      <div className='flex gap-7 flex-col col-span-12 lg:col-span-6 xl:col-span-5'>
        <h2 className='text-2xl font-semibold'>{product.title}</h2>
        <div className='grid grid-cols-2 gap-3'>
          <label
            className={`${!!variant ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-200'} transition-colors duration-300 text-center text-white p-3 rounded-md`}>
            <button disabled={!variant}>Заказать</button>
          </label>
          <label
            className='bg-white text-center text-purple-600 hover:bg-purple-700 hover:text-white transition-colors duration-300 p-3 rounded-md border border-purple-600'>
            <button>Контакты</button>
          </label>
        </div>
        <Accordion label='Дополнительная информация' value={'Дополнительная информация'}/>
        <div className='h-px bg-gray-200'></div>
        <VariantSelector variants={product?.Variants ?? []}
                         options={options}
                         onChange={v => {
                           if (v?.Image?.Image?.src?.length) setStartImage(v.Image.Image.src)
                           setVariant(v);
                         }}/>
        <div className='h-px bg-gray-200'></div>
      </div>
    </div>
  </main>
}

type Props = {
  product: ProductModel
}

type Options = {
  id: string,
  label: string,
  options: {
    label: string,
    value: string
  }[]
}
