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
import {Accordion, AccordionItem, Button, Snippet} from "@nextui-org/react";
import ChevronIcon from "@/theme/assets/ChevronIcon";
import Price from "@/theme/snippents/Price";
import {create} from "@/services/Orders";
import {format} from "date-fns";

const schema = yup
  .object({
    name: yup.string().required(),
    phone: yup.number().positive().integer().required(),
    email: yup.string().email().required(),
    description: yup.string()
  })
  .required()

export default function ProductPage({product, informationSettings}: Props) {
  const [variant, setVariant] = useState<VariantModel>()
  const [startImage, setStartImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>();
  const [submiting, setSubmiting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(schema),
  })

  /**
   *
   */
  const orderLink = useMemo(() => {
    if (!orderNumber) return null;
    return `${window.location.origin}/purchases/${orderNumber.replace('#', '')}`;
  }, [orderNumber])

  const options = useMemo(() => {
    if (product && product?.Category && product?.Variants?.length) {
      return product.Category.CategoryOption?.reduce((acc: Options[], categoryOption) => {
        const optionVariantValues = (product?.Variants ?? []).reduce((acc: string[], variant) => {
          (variant.VariantValue ?? []).map(variantValue => {
            if (variantValue.option_id === categoryOption.option_id && variantValue.Value?.value && !acc.includes(variantValue.Value.value)) acc.push(variantValue.Value.value);
          });
          return acc;
        }, []);
        if (optionVariantValues?.length) acc.push({
          id: categoryOption.Option.id,
          label: categoryOption.Option.title,
          options: optionVariantValues.map(i => ({label: i, value: i}))
        })
        return acc;

      }, []);
    }

    return [];
  }, [product]);


  console.log('options => ', options);

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

  const orderFormMarkup = <form className={'relative flex flex-col p-5 gap-5 h-screen'}
                                onSubmit={handleSubmit((data) => {
                                  if (variant && product) {
                                    setSubmiting(true);
                                    create({
                                      data: {
                                        name: `#${format(new Date(), 'yyMMdd-HHmmssSSS')}`,
                                        Customer: {
                                          connectOrCreate: {
                                            where: {
                                              email: data.email
                                            },
                                            create: {
                                              email: data.email,
                                              name: data.name,
                                              phone: `${data.phone}`
                                            }
                                          }
                                        },
                                        Brand: {
                                          connect: {
                                            id: product.brand_id
                                          }
                                        },
                                        OrderItems: {
                                          createMany: {
                                            data: {
                                              price: product.price,
                                              finalPrice: product.final_price,
                                              imageId: variant?.image_id,
                                              productId: product.id,
                                              variantId: variant.id,
                                              quantity: 1,
                                              title: product.title,
                                              variantTitle: (variant?.VariantValue ?? []).map(i => `${i?.Value?.Option?.title}: ${i?.Value?.value}`).join(', ')
                                            }
                                          }
                                        },
                                        OrderShippings: {
                                          createMany: {
                                            data: {
                                              name: data.name,
                                              phone: `${data.phone}`,
                                              note: data?.description ?? ''
                                            }
                                          }
                                        }
                                      }
                                      // }).then(order => {
                                    }).then((order: any) => {
                                      if (order.name) setOrderNumber(order.name);
                                    }).finally(() => setSubmiting(false));
                                  }
                                })}>
    <div
      className={'p-5 -mx-5 -mt-5 bg-gray-800 min-h-[120px] text-white text-2xl flex justify-between items-center'}>
      <h3>Заказ товара</h3>
      <span role={"button"} onClick={() => setOpen(false)}> <AiOutlineClose/></span>
    </div>
    <div className={'flex flex-col gap-5 justify-between overflow-auto flex-grow'}>
      <div className={'flex flex-col gap-5 overflow-auto'}>
        <span>Данные покупателя</span>
        <Input {...register("name")} disabled={submiting} variant="bordered" label="Name"
               errorMessage={errors.name?.message}
               isInvalid={false}/>
        <Input {...register("phone")} disabled={submiting} variant="bordered" label="Phone"
               errorMessage={errors.phone?.message}
               isInvalid={!!errors.phone?.message?.length}/>
        <Input {...register("email")} disabled={submiting} variant="bordered" label="Email"
               errorMessage={errors.email?.message}
               isInvalid={!!errors.email?.message?.length}/>
        <Textarea
          {...register('description')}
          disabled={submiting}
          label="Description"
          variant={'bordered'}
        />
      </div>
      <div className={'bg-gray-800 text-white text-xl rounded-2xl'}>
        <div className={'p-5 flex flex-col '}>
          <span className={'text-2xl font-black'}>{product.title}</span>
          <span className={'max-h-[100px] overflow-auto'}>
              {
                (variant?.VariantValue ?? []).map(i => {
                  return `${i.Value?.Option?.title}: ${i.Value?.value}`
                }).join(', ')
              }
              </span>
        </div>
        <div className={'flex gap-2 p-5'}>
          <span className={'text-gray-400'}>Стоимость товара: </span>
          <Price finalPrice={+product.final_price}/>
        </div>
        <div className={'p-5 bg-purple-900 text-3xl rounded-b-2xl'}>
          <span className={'flex gap-2'}>Итого: <Price size={'3xl'} finalPrice={+product.final_price}/></span>
        </div>
      </div>
    </div>
    <div className={'flex gap-5 justify-between'}>
      <Button isLoading={submiting} type={'submit'} className={'bg-gray-800 rounded-2xl text-white p-5 w-full'}
              size={'lg'}>
        Оформить
      </Button>
      <Button className={'border border-solid border-gray-800 rounded-2xl w-full'} size={'lg'}
              onClick={() => setOpen(false)}>
        Отмена
      </Button>
    </div>
  </form>;

  const thankYouMarkup = <div className={'relative flex flex-col p-5 gap-5 h-screen'}>
    <div
      className={'p-5 -mx-5 -mt-5 bg-gray-800 min-h-[120px] text-white text-2xl flex justify-between items-center'}>
      <h3>Заказ товара</h3>
      <span role={"button"} onClick={() => setOpen(false)}> <AiOutlineClose/></span>
    </div>
    <div className={'text-center mx-28'}>
      <span className={'block'}>Спасибо 🖤</span>
      <br/>
      <p>Заказ № {orderNumber} успешно отправлен!</p>
      <br/>
      <p>Ожидайте, представитель "{product?.Brand?.name ?? 'брэнда'}" свяжется с вами для подтверждления заказа.</p>
      <br/>
      {
        orderLink && <>
          <p>Вот ссылка для остлеживания статуса заказа</p>
          <Snippet hideSymbol size="sm">
            <a href={orderLink} className={'text-purple-700 hover:underline'}>{orderLink}</a>
          </Snippet>
        </>
      }
    </div>
  </div>

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
        <Price finalPrice={+product.final_price} price={+product.price}/>
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

                           console.log('VARIANT => ', v)

                           if (v?.Image?.Image?.src?.length) setStartImage(v.Image.Image.src)
                           setVariant(v);
                         }}/>
        <div className='h-px bg-gray-200'></div>
      </div>
    </div>
    <Drawer open={open} onClose={() => setOpen(false)} useCloseBtn={false}>
      {!orderNumber && orderFormMarkup}
      {!!orderNumber && thankYouMarkup}
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
  id: bigint,
  label: string,
  options: {
    label: string,
    value: string
  }[]
}
