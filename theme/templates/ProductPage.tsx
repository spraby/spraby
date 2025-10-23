'use client'

import Link from "next/link";
import DoubleSlider from "@/theme/snippents/DoubleSlider";
import Tabs from "@/theme/snippents/Tabs";
import VariantSelector from "@/theme/snippents/VariantSelector";
import {useEffect, useMemo, useState} from "react";
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
import {setStatistic} from "@/services/ProductStatistics";
import {differenceInMonths, format} from "date-fns";
import {BreadcrumbItem} from "@/types";

const BreadcrumbSeparatorIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="mx-1 h-3.5 w-3.5 text-gray-400" aria-hidden="true">
    <path d="M6 3.5L10 8l-4 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownMiniIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="M4.5 6.5L8 10l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 text-gray-400" aria-hidden="true">
    <path d="M8 1.333c2.577 0 4.667 2.09 4.667 4.667 0 3.5-4.667 8.667-4.667 8.667S3.333 9.5 3.333 6c0-2.577 2.09-4.667 4.667-4.667zm0 2.667a2 2 0 100 4 2 2 0 000-4z" fill="currentColor"/>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 text-gray-400" aria-hidden="true">
    <path d="M5.333 1.333V3M10.667 1.333V3M2.667 5.333h10.666M3.333 3h9.334c.368 0 .666.298.666.667v8.666c0 .368-.298.667-.666.667H3.333a.667.667 0 01-.666-.667V3.667c0-.369.298-.667.666-.667z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const schema = yup
  .object({
    name: yup.string().required(),
    phone: yup.number().positive().integer().required(),
    email: yup.string().email().required(),
    description: yup.string()
  })
  .required()

export default function ProductPage({product, informationSettings, breadcrumbs = []}: Props) {
  const [variant, setVariant] = useState<VariantModel>()
  const [startImage, setStartImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>();
  const [submiting, setSubmiting] = useState(false);

  const hasDiscount = Number(product.price) > Number(product.final_price);
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.final_price) / Number(product.price)) * 100)
    : 0;

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    setStatistic(product.id, 'view').then();
  }, []);

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

        const sortedOptionVariantValues: string[] = [];
        categoryOption.Option.Values?.sort((a, b) => a.position - b.position).forEach(i => {
          const o = optionVariantValues.find(j => j === i.value);
          if (o) sortedOptionVariantValues.push(o);
        });

        if (optionVariantValues?.length) acc.push({
          id: categoryOption.Option.id,
          label: categoryOption.Option.title,
          options: sortedOptionVariantValues.map(i => ({label: i, value: i}))
        })

        return acc;
      }, []);
    }

    return [];
  }, [product]);

  const tags = useMemo(() => {
    const unique = new Set<string>();
    if (product.Category?.title) unique.add(product.Category.title);
    if (product.Brand?.name) unique.add(product.Brand.name);
    options?.forEach(option => {
      option.options.forEach(item => {
        if (item.label) unique.add(item.label);
      });
    });
    return Array.from(unique);
  }, [options, product]);
  const [showAllTags, setShowAllTags] = useState(false);
  const COLLAPSED_TAG_COUNT = 8;
  const visibleTags = useMemo(
    () => (showAllTags ? tags : tags.slice(0, COLLAPSED_TAG_COUNT)),
    [showAllTags, tags]
  );
  useEffect(() => {
    setShowAllTags(false);
  }, [product.id]);

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

  const brandLocation = useMemo(() => {
    const settings = (product.Brand?.Settings ?? []).find(i => i.type === 'addresses');
    if (!settings?.data?.length) return null;
    const raw = Array.isArray(settings.data) ? settings.data.find(Boolean) : settings.data;
    if (!raw) return null;
    return String(raw).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || null;
  }, [product]);

  const pluralize = (value: number, forms: [string, string, string]) => {
    const n = Math.abs(value) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  };

  const brandSinceText = useMemo(() => {
    const createdValue = (product.Brand as any)?.created_at ?? (product.Brand as any)?.createdAt;
    if (!createdValue) return null;
    const createdDate = new Date(createdValue);
    if (Number.isNaN(createdDate.getTime())) return null;
    const months = differenceInMonths(new Date(), createdDate);
    if (months <= 0) return 'На Spraby менее месяца';
    if (months < 12) {
      return `На Spraby ${months} ${pluralize(months, ['месяц', 'месяца', 'месяцев'])}`;
    }
    const years = Math.floor(months / 12);
    const restMonths = months % 12;
    let result = `На Spraby ${years} ${pluralize(years, ['год', 'года', 'лет'])}`;
    if (restMonths > 0) {
      result += ` ${restMonths} ${pluralize(restMonths, ['месяц', 'месяца', 'месяцев'])}`;
    }
    return result;
  }, [product]);

  const orderFormMarkup = <form className={'relative flex flex-col p-5 gap-5 h-screen'}
                                onSubmit={
                                  handleSubmit((data) => {
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
                                                final_price: product.final_price,
                                                image_id: variant?.image_id,
                                                product_id: product.id,
                                                variant_id: variant.id,
                                                quantity: 1,
                                                title: product.title,
                                                variant_title: (variant?.VariantValue ?? []).map(i => `${i?.Value?.Option?.title}: ${i?.Value?.value}`).join(', ')
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
                                      }).then(order => {
                                        if (order.name) setOrderNumber(order.name);
                                      }).finally(() => setSubmiting(false));
                                    }
                                  })
                                }>
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

  return !!product && <main className='px-4 pt-6 pb-12 sm:px-6 lg:px-8'>
    <div className='mx-auto flex max-w-6xl flex-col gap-4 lg:gap-8'>
      {breadcrumbs.length > 0 && (
        <nav aria-label="breadcrumb" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 no-scrollbar">
          <ol className="flex items-center gap-1.5 whitespace-nowrap pr-5 pe-8 text-sm font-medium text-gray-500 lg:pr-0 lg:pe-0">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.title}-${index}`} className="flex items-center">
                {crumb.url && index !== breadcrumbs.length - 1 ? (
                  <>
                    <Link href={crumb.url} className="inline-flex items-center gap-1 text-gray-600 transition hover:text-purple-600">
                      {crumb.title}
                    </Link>
                    <BreadcrumbSeparatorIcon/>
                  </>
                ) : (
                  <span className="text-gray-800 font-semibold">{crumb.title}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className='flex w-full flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-10'>
        <div className='order-1 lg:order-1 flex flex-col gap-7 lg:col-span-7 xl:col-span-7'>
          <div className='relative'>
            <DoubleSlider images={(product.Images ?? []).map(i => i.Image?.src as string)} startImage={startImage}/>
            {hasDiscount && discountPercent > 0 && (
              <span className='absolute right-4 top-4 inline-flex items-center rounded-lg bg-purple-500 px-3 py-1.5 text-sm font-semibold text-white shadow-md'>
                -{discountPercent}%
              </span>
            )}
          </div>
          <div className='hidden lg:flex flex-col gap-7'>
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
        </div>
        <div className='order-2 lg:order-2 flex flex-col gap-7 lg:col-span-5 xl:col-span-5'>
          <h2 className='text-2xl font-semibold text-gray-900 sm:text-3xl'>{product.title}</h2>
          <Price finalPrice={+product.final_price} price={+product.price}/>
          {tags.length > 0 && (
            <div className='flex flex-col gap-2'>
              <div className='flex flex-wrap gap-2'>
                {visibleTags.map((tag) => (
                  <span key={tag} className='inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-gray-600'>
                    {tag}
                  </span>
                ))}
              </div>
              {tags.length > COLLAPSED_TAG_COUNT && (
                <button
                  type='button'
                  onClick={() => setShowAllTags((prev) => !prev)}
                  className='self-end text-xs font-semibold text-purple-600 transition hover:text-purple-700'
                >
                  {showAllTags ? 'Скрыть теги' : `Показать все (${tags.length})`}
                </button>
              )}
            </div>
          )}

          <div className='grid grid-cols-2 gap-3'>
            <label
              className={`${!!variant ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-200'} transition-colors duration-300 text-center text-white p-3 rounded-md`}>
              <button disabled={!variant} onClick={() => {
                setOpen(true);
                setStatistic(product.id, 'add_to_cart').then();
              }}>Заказать</button>
            </label>
            <label
              className='bg-white text-center text-purple-600 hover:bg-purple-700 hover:text-white transition-colors duration-300 p-3 rounded-md border border-purple-600'>
              <button>Контакты</button>
            </label>
          </div>
          <VariantSelector
            variants={product?.Variants ?? []}
            options={options}
            onChange={v => {
              if (v?.Image?.Image?.src?.length) setStartImage(v.Image.Image.src);
              setVariant(v);
            }}
          />
          <div className='h-px bg-gray-200'></div>
          <Accordion className='pb-0'>
            <AccordionItem
              key="info"
              aria-label="Дополнительная информация"
              title="Дополнительная информация"
              indicator={isOpen => {
                return <span className={`block border border-gray-300 rounded-full p-1 ${!isOpen ? 'rotate-180' : ''}`}>
                  <ChevronIcon width={20} height={20}/>
                </span>;
              }}
              classNames={{
                base: 'py-0',
                trigger: 'py-1 px-0 data-[open=true]:pb-1 data-[open=true]:pt-1',
                title: 'text-sm font-normal text-gray-700',
                content: 'text-xs text-gray-600'
              }}
            >
              <div
                className="text-xs leading-relaxed"
                dangerouslySetInnerHTML={{__html: (informationSettings?.description ?? '') as string}}
              />
            </AccordionItem>
          </Accordion>

          <div className='h-px bg-gray-200'></div>
          {(product.Brand?.name || brandLocation || brandSinceText) && (
            <div className='flex items-start gap-4 rounded-2xl bg-white py-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-gray-500 uppercase'>
                {(product.Brand?.name ?? product.Brand?.User?.firstName ?? 'S').toString().trim().slice(0, 2)}
              </div>
              <div className='flex flex-col gap-2 text-sm text-gray-600'>
                {product.Brand?.name && (
                  <span className='text-base font-semibold text-gray-900'>{product.Brand.name}</span>
                )}
                {brandLocation && (
                  <div className='flex items-start gap-2'>
                    <LocationIcon/>
                    <span className='leading-snug'>{brandLocation}</span>
                  </div>
                )}
                {brandSinceText && (
                  <div className='flex items-start gap-2'>
                    <CalendarIcon/>
                    <span className='leading-snug'>{brandSinceText}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className='h-px bg-gray-200'></div>
        </div>
        <div className='order-3 flex flex-col gap-7 lg:hidden'>
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
  breadcrumbs?: BreadcrumbItem[]
}

type Options = {
  id: bigint,
  label: string,
  options: {
    label: string,
    value: string
  }[]
}
