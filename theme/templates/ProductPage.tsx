'use client'

import DoubleSlider from "@/theme/snippents/DoubleSlider";
import Tabs from "@/theme/snippents/Tabs";
import VariantSelector from "@/theme/snippents/VariantSelector";
import {useMemo, useState} from "react";
import {ProductModel, VariantModel} from "@/prisma/types";
import Drawer from "@/theme/snippents/Drawer";
import {AiOutlineClose} from "react-icons/ai";
import {useForm} from "react-hook-form"
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup from "yup"
import {Input, Textarea} from "@nextui-org/input";
import {Accordion, AccordionItem} from "@nextui-org/react";
import ChevronIcon from "@/theme/assets/ChevronIcon";
import {toMoney} from "@/services/utilits";
import Price from "@/theme/snippents/Price";

const schema = yup
  .object({
    name: yup.string().required(),
    phone: yup.number().positive().integer().required(),
    email: yup.string().email().required()
  })
  .required()

export default function ProductPage({product, informationSettings}: Props) {
  const [variant, setVariant] = useState<VariantModel>()
  const [startImage, setStartImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(schema),
  })

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

  /**
   *
   */
  const delivery = useMemo(() => {
    const settings = (product.Brand?.Settings ?? []).find(i => i.type === 'delivery')
    return (settings?.data as any)?.description ?? '';
  }, [product]);

  /**
   *
   */
  const refund = useMemo(() => {
    const settings = (product.Brand?.Settings ?? []).find(i => i.type === 'refund')
    return (settings?.data as any)?.description ?? '';
  }, [product]);

  return !!product && <main className='pt-10'>
    <div className='container mx-auto grid gap-10 grid-cols-12'>
      <div className='flex gap-7 flex-col col-span-12 lg:col-span-6 xl:col-span-7'>
        <DoubleSlider images={(product.Images ?? []).map(i => i.Image?.src as string)} startImage={startImage}/>
        <Tabs
          tabs={[
            {
              label: 'Описание',
              value: product.description
            },
            {
              label: 'Способы доставки',
              value: delivery
            },
            {
              label: 'Условия возврата',
              value: refund
            },
          ]}
        />
        <div className='h-px bg-gray-200'></div>
      </div>
      <div className='flex gap-7 flex-col col-span-12 lg:col-span-6 xl:col-span-5'>
        <h2 className='text-2xl font-semibold'>{product.title}</h2>
        <Price finalPrice={+product.finalPrice} price={+product.price}/>
        <div className='grid grid-cols-2 gap-3'>
          <label
            className={`${!!variant ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-200'} transition-colors duration-300 text-center text-white p-3 rounded-md`}>
            <button disabled={!variant} onClick={() => setOpen(true)}>Заказать</button>
          </label>
          <label
            className='bg-white text-center text-purple-600 hover:bg-purple-700 hover:text-white transition-colors duration-300 p-3 rounded-md border border-purple-600'>
            <button>Контакты</button>
          </label>
        </div>

        <Accordion>
          <AccordionItem
            key="info"
            aria-label="Дополнительная информация"
            title="Дополнительная информация"
            indicator={isOpen => {
              return <span className={`block border border-gray-300 rounded-full p-1 ${!isOpen ? 'rotate-180' : ''}`}>
                <ChevronIcon width={20} height={20}/>
              </span>
            }}
          >
            <div dangerouslySetInnerHTML={{__html: (informationSettings?.description ?? '') as string}}/>
          </AccordionItem>
        </Accordion>

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
    <Drawer open={open} onClose={() => setOpen(false)} useCloseBtn={false}>
      <form className={'relative flex flex-col p-5 gap-5 h-screen'} onSubmit={handleSubmit(() => {
      })}>
        <div
          className={'p-5 -mx-5 -mt-5 bg-gray-800 min-h-[120px] text-white text-2xl flex justify-between items-center'}>
          <h3>Заказ товара</h3>
          <span role={"button"} onClick={() => setOpen(false)}> <AiOutlineClose/></span>
        </div>
        <div className={'flex flex-col gap-5 justify-between overflow-auto flex-grow'}>
          <div className={'flex flex-col gap-5 overflow-auto'}>
            <span>Данные покупателя</span>
            <Input {...register("name")} variant="bordered" label="Name" errorMessage={errors.name?.message}
                   isInvalid={false}/>
            <Input {...register("phone")} variant="bordered" label="Phone" errorMessage={errors.phone?.message}
                   isInvalid={!!errors.phone?.message?.length}/>
            <Input {...register("email")} variant="bordered" label="Email" errorMessage={errors.email?.message}
                   isInvalid={!!errors.email?.message?.length}/>
            <Textarea
              label="Description"
              variant={'bordered'}
            />
          </div>
          <div className={'bg-gray-800 text-white text-xl rounded-2xl'}>
            <div className={'p-5 flex flex-col '}>
              <span className={'text-2xl font-black'}>{product.title}</span>
              <span className={'max-h-[100px] overflow-auto'}>
              {
                (variant?.Values ?? []).map(i => {
                  return `${i.Value?.Option?.title}: ${i.Value?.value}`
                }).join(', ')
              }
              </span>
            </div>
            <div className={'flex gap-2 p-5'}>
              <span className={'text-gray-400'}>Стоимость товара: </span>
              <Price finalPrice={+product.finalPrice}/>
            </div>
            <div className={'p-5 bg-purple-900 text-3xl rounded-b-2xl'}>
              <span className={'flex gap-2'}>Итого: <Price size={'3xl'} finalPrice={+product.finalPrice}/></span>
            </div>
          </div>
        </div>
        <div className={'flex gap-5 justify-between'}>
          <button className={'bg-gray-800 rounded-2xl text-white p-5 w-full'}>Оформить</button>
          <button className={'border border-solid border-gray-800 rounded-2xl w-full'}
                  onClick={() => setOpen(false)}>Отмена
          </button>
        </div>
      </form>
    </Drawer>
  </main>
}

type Props = {
  product: ProductModel
  informationSettings?: {
    description: string
  }
}

type Options = {
  id: string,
  label: string,
  options: {
    label: string,
    value: string
  }[]
}
