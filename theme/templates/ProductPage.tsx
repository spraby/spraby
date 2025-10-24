'use client'

import Link from "next/link";
import Image from "next/image";
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
import {Accordion, AccordionItem, Snippet} from "@nextui-org/react";
import ChevronIcon from "@/theme/assets/ChevronIcon";
import Price from "@/theme/snippents/Price";
import {create} from "@/services/Orders";
import {setStatistic} from "@/services/ProductStatistics";
import {differenceInMonths, format} from "date-fns";
import {BreadcrumbItem} from "@/types";

const normalizeImageSrc = (raw?: string | null) => {
  if (!raw) return null;
  const value = raw.trim();
  if (!value.length) return null;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return value;
  const stripped = value.replace(/^\.?\//, '');
  return `/${stripped}`;
};

const toIdString = (value: unknown) => {
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') return value;
  return '';
};

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
    name: yup.string().trim().required('Введите имя'),
    phone: yup.string().trim().required('Добавьте телефон'),
    email: yup.string().trim().email('Проверьте email').required('Укажите email'),
    description: yup.string().trim()
  })
  .required()

const flattenStrings = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap(item => flattenStrings(item));
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? [trimmed] : [];
  }
  if (typeof value === 'number') {
    return [String(value)];
  }
  return [];
};

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp'
};

const normalizeSocialUrl = (type: string, raw: string): string => {
  const value = raw.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (type === 'instagram') {
    const username = value.replace(/^@/, '');
    return `https://instagram.com/${username}`;
  }
  if (type === 'telegram') {
    const username = value.replace(/^@/, '');
    return `https://t.me/${username}`;
  }
  if (type === 'whatsapp') {
    const digitsOnly = value.replace(/[^\d]/g, '');
    return digitsOnly.length ? `https://wa.me/${digitsOnly}` : value;
  }
  if (value.includes('.')) {
    const sanitized = value.replace(/^https?:\/\//i, '');
    return `https://${sanitized}`;
  }
  return value;
};

const getSocialDisplayValue = (type: string, raw: string): string => {
  const value = raw.trim();
  if (!value) return '';
  if (type === 'instagram' || type === 'telegram') {
    const username = value.replace(/^@/, '');
    return `@${username}`;
  }
  return value;
};

const normalizePhoneHref = (value: string): string => {
  const clean = value.replace(/[^\d+]/g, '');
  return clean.length ? `tel:${clean}` : `tel:${value}`;
};

const normalizeEmailHref = (value: string): string => `mailto:${value.trim()}`;

type ContactSocial = {
  type: string
  label: string
  value: string
  url: string
  display: string
};

export default function ProductPage({product, informationSettings, breadcrumbs = []}: Props) {
  const [variant, setVariant] = useState<VariantModel>()
  const [startImage, setStartImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'order' | 'contacts'>('order');
  const [orderNumber, setOrderNumber] = useState<string>();
  const [submiting, setSubmiting] = useState(false);

  const handleDrawerClose = () => {
    setOpen(false);
    setOrderNumber(undefined);
    setDrawerMode('order');
  };

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

  const brandContacts = useMemo(() => {
    const settings = product.Brand?.Settings ?? [];
    const getSetting = (type: string) => settings.find(item => item.type === type)?.data;
    const phones = Array.from(new Set(flattenStrings(getSetting('phones'))));
    const emails = Array.from(new Set(flattenStrings(getSetting('emails'))));
    const socialsRaw = getSetting('socials');
    const socials: ContactSocial[] = Array.isArray(socialsRaw)
      ? (socialsRaw as any[]).reduce((acc, item) => {
        if (!item || typeof item !== 'object') return acc;
        const {type, link} = item as { type?: string, link?: string };
        if (typeof type !== 'string' || typeof link !== 'string') return acc;
        const normalizedType = type.trim().toLowerCase();
        const normalizedValue = link.trim();
        if (!normalizedType.length || !normalizedValue.length) return acc;
        const label = SOCIAL_LABELS[normalizedType] ?? normalizedType;
        const url = normalizeSocialUrl(normalizedType, normalizedValue);
        const display = getSocialDisplayValue(normalizedType, normalizedValue) || normalizedValue;
        acc.push({
          type: normalizedType,
          label,
          value: normalizedValue,
          url,
          display
        });
        return acc;
      }, [] as ContactSocial[]) : [];

    return {
      phones,
      emails,
      socials,
      hasAny: Boolean(phones.length || emails.length || socials.length)
    };
  }, [product]);

  const variantDetails = useMemo(() => {
    return (variant?.VariantValue ?? []).map(i => {
      const optionTitle = i?.Value?.Option?.title;
      const optionValue = i?.Value?.value;
      if (!optionTitle || !optionValue) return null;
      return {
        label: optionTitle,
        value: optionValue
      };
    }).filter(Boolean) as { label: string, value: string }[];
  }, [variant]);

  const variantSummary = useMemo(() => {
    return variantDetails.map(detail => `${detail.label}: ${detail.value}`).join(', ');
  }, [variantDetails]);

  const productPreviewImage = useMemo(() => {
    if (variant) {
      const matchedGalleryImage = (product.Images ?? []).find(image => {
        const variantId = toIdString(variant.image_id);
        if (!variantId) return false;
        const galleryIds = [image.image_id, image.id].map(toIdString).filter(Boolean);
        return galleryIds.includes(variantId);
      })?.Image?.src;
      if (matchedGalleryImage) return normalizeImageSrc(matchedGalleryImage);
      if (variant.Image?.Image?.src?.length) return normalizeImageSrc(variant.Image.Image.src);
    }
    const productImage = (product.Images ?? []).find(image => image.Image?.src?.length)?.Image?.src;
    if (productImage) return normalizeImageSrc(productImage);
    const variantImage = (product.Variants ?? []).find(v => v.Image?.Image?.src?.length)?.Image?.Image?.src;
    return normalizeImageSrc(variantImage);
  }, [variant, product]);

  const compactInputClassNames = useMemo(() => ({
    input: "text-sm",
    label: "text-xs font-medium text-gray-500"
  }), []);

  const orderFormMarkup = <form className={'relative flex h-full max-h-[100vh] min-h-0 flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6'}
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
                                                variant_title: variantSummary
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
    <div className="flex items-start justify-between px-1 pt-1">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold tracking-wide sm:text-xl">Заказ товара</h3>
        <p className="text-xs text-gray-500 sm:text-sm">Заполните данные, и мы свяжемся с вами</p>
      </div>
      <button
        type="button"
        onClick={handleDrawerClose}
        aria-label="Закрыть окно заказа"
        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
      >
        <AiOutlineClose className="h-5 w-5"/>
      </button>
    </div>
    <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto pb-3 sm:pb-2">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">Данные покупателя</span>
        <Input
          {...register("name")}
          disabled={submiting}
          variant="bordered"
          label="Name"
          size="sm"
          errorMessage={errors.name?.message}
          isInvalid={!!errors.name?.message?.length}
          classNames={compactInputClassNames}
        />
        <Input
          {...register("phone")}
          disabled={submiting}
          variant="bordered"
          label="Phone"
          size="sm"
          errorMessage={errors.phone?.message}
          isInvalid={!!errors.phone?.message?.length}
          classNames={compactInputClassNames}
        />
        <Input
          {...register("email")}
          disabled={submiting}
          variant="bordered"
          label="Email"
          size="sm"
          errorMessage={errors.email?.message}
          isInvalid={!!errors.email?.message?.length}
          classNames={compactInputClassNames}
        />
        <Textarea
          {...register('description')}
          disabled={submiting}
          label="Комментарий к заказу"
          variant="bordered"
          size="sm"
          minRows={2}
          classNames={compactInputClassNames}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
          <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-100 sm:h-[80px] sm:w-[80px]">
            {productPreviewImage ? (
              <Image
                src={productPreviewImage}
                alt={product.title}
                fill
                sizes="80px"
                className="object-cover object-center transition-transform duration-300"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[0.65rem] font-semibold text-gray-400">
                Нет фото
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 text-sm sm:text-base">
            <span className="text-sm font-semibold leading-tight text-gray-900 sm:text-base">{product.title}</span>
            {variantDetails.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {variantDetails.map(({label, value}) => (
                  <span
                    key={`${label}-${value}`}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-medium text-gray-700 ring-1 ring-gray-200 sm:text-xs"
                  >
                    <span className="uppercase tracking-wide text-[0.55rem] text-gray-400">{label}</span>
                    <span className="text-gray-900">{value}</span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-500 sm:text-sm">Параметры не выбраны</span>
            )}
          </div>
        </div>
        <div className="h-px bg-gray-100"></div>
        <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-wide text-gray-500 sm:text-sm">
          <span>Стоимость товара</span>
          <span className="flex items-center gap-2">
            <Price finalPrice={+product.final_price} price={+product.price} size="lg"/>
            {hasDiscount && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[0.65rem] font-semibold text-rose-600 sm:text-xs">
                -{discountPercent}%
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold text-gray-900 sm:text-lg">
          <span>Итого</span>
          <span className="flex items-baseline gap-1.5 sm:gap-2 text-purple-600">
            <Price finalPrice={+product.final_price} size="lg"/>
          </span>
        </div>
      </div>
    </div>
    <div className="flex flex-row gap-3 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <button
        type="submit"
        disabled={submiting}
        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submiting ? 'Отправляем...' : 'Оформить'}
      </button>
      <button
        type="button"
        onClick={handleDrawerClose}
        className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-100"
      >
        Отмена
      </button>
    </div>
  </form>;

  const thankYouMarkup = <div className={'relative flex h-screen flex-col gap-6 p-5 sm:p-6'}>
    <div className="flex items-start justify-between px-1 pt-1">
      <h3 className="text-lg font-semibold tracking-wide text-gray-900 sm:text-xl">Заказ оформлен</h3>
      <button
        type="button"
        onClick={handleDrawerClose}
        aria-label="Закрыть окно заказа"
        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
      >
        <AiOutlineClose className="h-5 w-5"/>
      </button>
    </div>
    <div className="mx-auto max-w-md text-center text-sm text-gray-700 sm:text-base">
      <span className="mt-2 block text-base font-semibold text-gray-900 sm:text-lg">Спасибо 🖤</span>
      <p className="mt-3">Заказ № {orderNumber} успешно отправлен!</p>
      <p className="mt-3">
        Ожидайте, представитель "{product?.Brand?.name ?? 'брэнда'}" свяжется с вами для подтверждения заказа.
      </p>
      {
        orderLink && <>
          <p className="mt-4">Вот ссылка для отслеживания статуса заказа</p>
          <Snippet hideSymbol size="sm" className="mt-2">
            <a href={orderLink} className={'text-purple-700 hover:underline'}>{orderLink}</a>
          </Snippet>
        </>
      }
    </div>
  </div>

  const contactMarkup = <div className={'relative flex h-full max-h-[100vh] min-h-0 flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6'}>
    <div className="flex items-start justify-between px-1 pt-1">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold tracking-wide sm:text-xl">Контакты продавца</h3>
        <p className="text-xs text-gray-500 sm:text-sm">
          Свяжитесь {product.Brand?.name ? `с ${product.Brand.name}` : 'с продавцом'} удобным способом
        </p>
      </div>
      <button
        type="button"
        onClick={handleDrawerClose}
        aria-label="Закрыть окно контактов"
        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
      >
        <AiOutlineClose className="h-5 w-5"/>
      </button>
    </div>
    <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto pb-3 sm:pb-2">
      {brandContacts.hasAny ? (
        <>
          {brandContacts.phones.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">Телефон</span>
              <div className="flex flex-col gap-2">
                {brandContacts.phones.map(phone => (
                  <a
                    key={phone}
                    href={normalizePhoneHref(phone)}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <span>{phone}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {brandContacts.emails.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">Email</span>
              <div className="flex flex-col gap-2">
                {brandContacts.emails.map(email => (
                  <a
                    key={email}
                    href={normalizeEmailHref(email)}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <span>{email}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {brandContacts.socials.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">Социальные сети</span>
              <div className="flex flex-col gap-2">
                {brandContacts.socials.map(social => (
                  <a
                    key={`${social.type}-${social.value}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <span className="text-[0.68rem] uppercase tracking-wide text-gray-400">{social.label}</span>
                    <span className="text-base text-purple-600">{social.display || social.value}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Контактные данные продавца появятся здесь, как только он их добавит.
        </div>
      )}
    </div>
    <div className="pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={handleDrawerClose}
        className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-100"
      >
        Закрыть
      </button>
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
            <button
              disabled={!variant}
              onClick={() => {
                if (!variant) return;
                setDrawerMode('order');
                setOrderNumber(undefined);
                setOpen(true);
                setStatistic(product.id, 'add_to_cart').then();
              }}
              className={`w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:!from-purple-700 hover:!to-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Заказать
            </button>
            <button
              onClick={() => {
                setDrawerMode('contacts');
                setOrderNumber(undefined);
                setOpen(true);
              }}
              className='w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-100'
            >
              Контакты
            </button>
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
    <Drawer open={open} onClose={handleDrawerClose} useCloseBtn={false}>
      {drawerMode === 'contacts' && contactMarkup}
      {drawerMode === 'order' && !orderNumber && orderFormMarkup}
      {drawerMode === 'order' && !!orderNumber && thankYouMarkup}
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
