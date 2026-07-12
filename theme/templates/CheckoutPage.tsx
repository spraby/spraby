'use client'

import Link from "next/link";
import Image from "next/image";
import {useState, useMemo, useEffect} from "react";
import {useForm} from "react-hook-form"
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup from "yup"
import {Input} from "@nextui-org/input";
import Money from "@/theme/snippents/Money";
import ShippingMethodPicker, {
  buildOrderShippingData,
  emptyShippingSelection,
  normalizeShippingMethods,
  validateShippingSelection,
  type ShippingErrors,
  type ShippingSelection,
  type StoreShippingMethod,
} from "@/theme/snippents/ShippingMethodPicker";
import {calculateDiscountPercent} from "@/services/utilits";
import {createWithNotifications, sendCustomerOrderSummaryEmail} from "@/services/Orders";
import {getShippingMethodsByBrandIds} from "@/services/ShippingMethods";
import {format} from "date-fns";
import {useCart} from "@/theme/hooks/useCart";

const schema = yup
  .object({
    name: yup.string().trim().required('Введите имя'),
    phone: yup.string().trim().required('Добавьте телефон'),
    email: yup.string().trim().email('Проверьте email').required('Укажите email'),
    description: yup.string().trim()
  })
  .required()

const BreadcrumbSeparatorIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="mx-1 h-3.5 w-3.5 text-gray-400" aria-hidden="true">
    <path d="M6 3.5L10 8l-4 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShoppingBagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-purple-600" aria-hidden="true">
    <path d="M6 6h12l1.5 12H4.5L6 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 6V5a3 3 0 116 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16 text-green-500" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type OrderResult = {
  orderNumber: string;
  brandName?: string;
  orderId?: string;
}

const VISIBLE_ITEMS_PER_BRAND = 3;
const SHIPPING_PRICE_FIELD_KEY = 'shipping_price';
const FREE_SHIPPING_THRESHOLD_FIELD_KEY = 'free_shipping_threshold';
const PICKUP_CUSTOMER_FIELD_KEY = 'pickup_point';
const PICKUP_MERCHANT_FIELD_KEY = 'pickup_points';

const selectedShippingMethod = (
  methods: StoreShippingMethod[],
  methodId?: string | null,
): StoreShippingMethod | null => {
  if (!methodId) return null;
  return methods.find(method => method.id === methodId) ?? null;
};

const shippingMethodFieldValue = (method: StoreShippingMethod | null, fieldKey: string): string | null => {
  const value = method?.merchantFields.find(field => field.key === fieldKey)?.value;
  if (Array.isArray(value)) return null;

  const normalized = `${value ?? ''}`.trim();
  return normalized.length ? normalized : null;
};

const parseShippingAmount = (value: string | null): number | null => {
  if (!value) return null;

  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
};

const isPickupShippingMethod = (method: StoreShippingMethod | null): boolean => {
  if (!method) return false;

  return method.customerFields.some(field => field.key === PICKUP_CUSTOMER_FIELD_KEY)
    || method.merchantFields.some(field => field.key === PICKUP_MERCHANT_FIELD_KEY);
};

const brandItemsTotal = (items: ReturnType<typeof useCart>['items']): number => {
  return items.reduce((sum, item) => sum + Number(item.finalPrice) * item.quantity, 0);
};

const shippingMethodCost = (method: StoreShippingMethod | null, brandTotal: number): number | null => {
  const price = parseShippingAmount(shippingMethodFieldValue(method, SHIPPING_PRICE_FIELD_KEY));
  if (price === null) return isPickupShippingMethod(method) ? 0 : null;

  const freeThreshold = parseShippingAmount(shippingMethodFieldValue(method, FREE_SHIPPING_THRESHOLD_FIELD_KEY));
  if (freeThreshold !== null && freeThreshold > 0 && brandTotal >= freeThreshold) {
    return 0;
  }

  return price;
};

export default function CheckoutPage() {
  const [submitting, setSubmitting] = useState(false);
  const [completedOrders, setCompletedOrders] = useState<OrderResult[]>([]);
  const [expandedBrandItems, setExpandedBrandItems] = useState<Record<string, boolean>>({});
  const { items: cartItems, removeItem, updateQuantity, clearCart } = useCart();

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(schema),
  })

  // Группировка товаров по брендам
  const itemsByBrand = useMemo(() => {
    const grouped = cartItems.reduce((acc, item) => {
      const brandId = item.brandId;
      if (!acc[brandId]) {
        acc[brandId] = {
          brandId,
          brandName: item.brandName || 'Продавец',
          items: []
        };
      }
      acc[brandId].items.push(item);
      return acc;
    }, {} as Record<string, { brandId: string; brandName: string; items: typeof cartItems }>);

    return Object.values(grouped);
  }, [cartItems]);

  const brandsCount = itemsByBrand.length;

  // Способы доставки брендов из корзины + выбор/значения покупателя по брендам.
  // Пока способы не загружены (или загрузка упала), оформить заказ нельзя —
  // иначе валидация обязательного выбора доставки пройдёт по пустому списку.
  const [shippingMethodsByBrand, setShippingMethodsByBrand] = useState<Record<string, StoreShippingMethod[]>>({});
  const [shippingReady, setShippingReady] = useState(false);
  const [shippingLoadFailed, setShippingLoadFailed] = useState(false);
  const [shippingRetryNonce, setShippingRetryNonce] = useState(0);
  const [shippingSelections, setShippingSelections] = useState<Record<string, ShippingSelection>>({});
  const [shippingErrors, setShippingErrors] = useState<Record<string, ShippingErrors | null>>({});

  const brandIdsKey = useMemo(
    () => itemsByBrand.map(brand => brand.brandId).sort().join(','),
    [itemsByBrand]
  );

  useEffect(() => {
    const brandIds = brandIdsKey ? brandIdsKey.split(',') : [];
    if (!brandIds.length) {
      setShippingMethodsByBrand({});
      setShippingLoadFailed(false);
      setShippingReady(true);
      return;
    }

    let cancelled = false;
    setShippingReady(false);
    setShippingLoadFailed(false);
    getShippingMethodsByBrandIds(brandIds)
      .then(grouped => {
        if (cancelled) return;
        const normalized: Record<string, StoreShippingMethod[]> = {};
        for (const brandId of brandIds) {
          normalized[brandId] = normalizeShippingMethods(grouped[brandId] ?? []);
        }
        setShippingMethodsByBrand(normalized);
        setShippingReady(true);
      })
      .catch(error => {
        console.error('Failed to load shipping methods', error);
        if (!cancelled) setShippingLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [brandIdsKey, shippingRetryNonce]);

  const updateShippingSelection = (brandId: string, selection: ShippingSelection) => {
    setShippingSelections(prev => ({...prev, [brandId]: selection}));
    setShippingErrors(prev => ({...prev, [brandId]: null}));
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return sum + (Number(item.finalPrice) * item.quantity);
    }, 0);
  }, [cartItems]);

  const totalDiscount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price);
      const finalPrice = Number(item.finalPrice);
      if (price > finalPrice) {
        return sum + ((price - finalPrice) * item.quantity);
      }
      return sum;
    }, 0);
  }, [cartItems]);

  const originalTotal = useMemo(() => {
    return totalPrice + totalDiscount;
  }, [totalPrice, totalDiscount]);

  const totalUnits = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const shippingSummary = useMemo(() => {
    if (!shippingReady) {
      return {
        selected: 0,
        required: 0,
        withoutMethods: 0,
        amount: null as number | null,
        label: 'Загружаем доставку',
      };
    }

    const required = itemsByBrand.filter(brand => (shippingMethodsByBrand[brand.brandId] ?? []).length > 0).length;
    const selected = itemsByBrand.filter(brand => {
      const methods = shippingMethodsByBrand[brand.brandId] ?? [];
      return methods.length > 0 && Boolean(shippingSelections[brand.brandId]?.methodId);
    }).length;
    const withoutMethods = itemsByBrand.length - required;
    let amount: number | null = null;
    let hasUnknownCost = false;

    if (required > 0 && selected === required) {
      amount = 0;

      for (const brand of itemsByBrand) {
        const methods = shippingMethodsByBrand[brand.brandId] ?? [];
        if (methods.length === 0) continue;

        const method = selectedShippingMethod(methods, shippingSelections[brand.brandId]?.methodId);
        const cost = shippingMethodCost(method, brandItemsTotal(brand.items));
        if (cost === null) {
          hasUnknownCost = true;
          break;
        }

        amount += cost;
      }
    }

    return {
      selected,
      required,
      withoutMethods,
      amount: hasUnknownCost ? null : amount,
      label: required > 0
        ? selected === required
          ? hasUnknownCost ? 'Согласуется' : ''
          : `${selected} из ${required} выбрано`
        : 'Согласуется продавцами',
    };
  }, [itemsByBrand, shippingMethodsByBrand, shippingReady, shippingSelections]);

  const checkoutTotal = useMemo(() => {
    return totalPrice + (shippingSummary.amount ?? 0);
  }, [shippingSummary.amount, totalPrice]);

  const compactInputClassNames = useMemo(() => ({
    input: "text-sm",
    label: "text-xs font-medium text-gray-500",
    inputWrapper: "!rounded-xl",
  }), []);

  const onSubmit = async (data: any) => {
    if (cartItems.length === 0 || !shippingReady) return;

    // Выбор способа доставки обязателен для брендов, у которых способы есть
    const nextErrors: Record<string, ShippingErrors | null> = {};
    let hasShippingErrors = false;
    for (const brand of itemsByBrand) {
      const errors = validateShippingSelection(
        shippingMethodsByBrand[brand.brandId] ?? [],
        shippingSelections[brand.brandId] ?? emptyShippingSelection(),
      );
      nextErrors[brand.brandId] = errors;
      if (errors) hasShippingErrors = true;
    }
    if (hasShippingErrors) {
      setShippingErrors(nextErrors);
      return;
    }

    const isMultiBrand = itemsByBrand.length > 1;
    setSubmitting(true);
    try {
      // Создаем заказы для каждого бренда
      const orderPromises = itemsByBrand.map(async (brand) => {
        const order = await createWithNotifications({
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
                id: BigInt(brand.brandId)
              }
            },
            OrderItems: {
              createMany: {
                data: brand.items.map(item => ({
                  price: item.price,
                  final_price: item.finalPrice,
                  product_id: BigInt(item.productId),
                  variant_id: item.variantId ? BigInt(item.variantId) : undefined,
                  quantity: item.quantity,
                  title: item.title,
                  variant_title: item.variantTitle ?? ''
                }))
              }
            },
            OrderShippings: {
              createMany: {
                data: {
                  name: data.name,
                  phone: `${data.phone}`,
                  note: data?.description ?? '',
                  ...buildOrderShippingData(
                    shippingMethodsByBrand[brand.brandId] ?? [],
                    shippingSelections[brand.brandId] ?? emptyShippingSelection(),
                  )
                }
              }
            }
          }
        }, {
          sendCustomerEmail: !isMultiBrand,
          sendSellerEmail: true,
          awaitNotifications: isMultiBrand,
        });

        return {
          orderNumber: order.name,
          brandName: brand.brandName,
          orderId: String(order.id),
        };
      });

      const orders = await Promise.all(orderPromises);
      if (isMultiBrand) {
        try {
          const orderIds = orders
            .map(order => order.orderId)
            .filter((id): id is string => Boolean(id));
          if (orderIds.length > 0) {
            await sendCustomerOrderSummaryEmail(orderIds);
          }
        } catch (error) {
          console.error('Failed to send customer order summary email', error);
        }
      }
      if (orders.length > 0) {
        setCompletedOrders(orders);
        clearCart();
      }
    } catch (error) {
      console.error('Failed to create order', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrders.length > 0) {
    return (
      <main className='px-4 pt-6 pb-12 sm:px-6 lg:px-8'>
        <div className='mx-auto flex max-w-6xl flex-col gap-8'>
          <nav aria-label="breadcrumb" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <ol className="flex items-center gap-1.5 whitespace-nowrap pr-5 pe-8 text-sm font-medium text-gray-500 lg:pr-0 lg:pe-0">
              <li className="flex items-center">
                <Link href="/" className="inline-flex items-center gap-1 text-gray-600 transition hover:text-purple-600">
                  Главная
                </Link>
                <BreadcrumbSeparatorIcon/>
              </li>
              <li className="flex items-center">
                <span className="text-gray-800 font-semibold">Успешный заказ</span>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col items-center gap-6 rounded-3xl bg-white p-8 sm:p-12 shadow-sm border border-gray-100">
            <CheckCircleIcon/>
            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {completedOrders.length === 1 ? 'Заказ успешно оформлен!' : 'Заказы успешно оформлены!'}
              </h1>
              <p className="text-base sm:text-lg text-gray-600">Спасибо за ваш заказ 🖤</p>
            </div>

            <div className="w-full max-w-md flex flex-col gap-4">
              {completedOrders.length > 1 && (
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                  <p className="text-sm text-blue-900 leading-relaxed">
                    <span className="font-semibold">Обратите внимание:</span> Вы заказали товары от {completedOrders.length} продавцов,
                    поэтому было создано {completedOrders.length} отдельных заказа. Каждый продавец свяжется с вами отдельно.
                  </p>
                </div>
              )}

              {completedOrders.map((order, index) => {
                const orderLink = `${window.location.origin}/purchases/${order.orderNumber.replace('#', '')}`;

                return (
                  <div key={order.orderNumber} className="rounded-2xl bg-gray-50 p-6 flex flex-col gap-3">
                    {completedOrders.length > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Заказ {index + 1} из {completedOrders.length}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Продавец:</span>
                      <span className="font-semibold text-gray-900">{order.brandName}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Номер заказа:</span>
                      <span className="font-semibold text-purple-600">{order.orderNumber}</span>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={orderLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full rounded-lg bg-white border border-gray-200 py-2.5 text-sm font-semibold text-purple-600 text-center transition hover:border-purple-200 hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
                      >
                        Отслеживать этот заказ
                      </Link>
                    </div>
                  </div>
                );
              })}

              <p className="text-sm text-gray-600 leading-relaxed text-center pt-2">
                Представители магазинов свяжутся с вами в ближайшее время для подтверждения заказов и уточнения деталей доставки.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-4">
              <Link
                href="/"
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 text-sm font-semibold text-white text-center shadow-sm transition hover:from-purple-700 hover:to-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
              >
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className='px-4 pt-6 pb-12 sm:px-6 lg:px-8'>
        <div className='mx-auto flex max-w-6xl flex-col gap-8'>
          <nav aria-label="breadcrumb" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <ol className="flex items-center gap-1.5 whitespace-nowrap pr-5 pe-8 text-sm font-medium text-gray-500 lg:pr-0 lg:pe-0">
              <li className="flex items-center">
                <Link href="/" className="inline-flex items-center gap-1 text-gray-600 transition hover:text-purple-600">
                  Главная
                </Link>
                <BreadcrumbSeparatorIcon/>
              </li>
              <li className="flex items-center">
                <span className="text-gray-800 font-semibold">Корзина</span>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col items-center gap-6 rounded-3xl bg-white p-12 shadow-sm border border-gray-100">
            <ShoppingBagIcon/>
            <h1 className="text-2xl font-bold text-gray-900">Корзина пуста</h1>
            <p className="text-gray-600 text-center max-w-md">
              Добавьте товары в корзину, чтобы оформить заказ
            </p>
            <Link
              href="/"
              className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
            >
              Начать покупки
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='px-4 pt-6 pb-12 sm:px-6 lg:px-8 relative z-0'>
      <div className='mx-auto flex max-w-6xl flex-col gap-8'>
        <nav aria-label="breadcrumb" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 no-scrollbar">
          <ol className="flex items-center gap-1.5 whitespace-nowrap pr-5 pe-8 text-sm font-medium text-gray-500 lg:pr-0 lg:pe-0">
            <li className="flex items-center">
              <Link href="/" className="inline-flex items-center gap-1 text-gray-600 transition hover:text-purple-600">
                Главная
              </Link>
              <BreadcrumbSeparatorIcon/>
            </li>
            <li className="flex items-center">
              <span className="text-gray-800 font-semibold">Оформление заказа</span>
            </li>
          </ol>
        </nav>

        <div className="flex items-center gap-3">
          <ShoppingBagIcon/>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Оформление заказа</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8 lg:pb-0">
          <section className="flex flex-col gap-5">
            {itemsByBrand.map((brand) => {
              const methods = shippingMethodsByBrand[brand.brandId] ?? [];
              const selection = shippingSelections[brand.brandId] ?? emptyShippingSelection();
              const isExpanded = expandedBrandItems[brand.brandId] ?? false;
              const visibleItems = isExpanded ? brand.items : brand.items.slice(0, VISIBLE_ITEMS_PER_BRAND);
              const hiddenItemsCount = brand.items.length - visibleItems.length;
              const brandTotal = brand.items.reduce((sum, item) => sum + Number(item.finalPrice) * item.quantity, 0);
              const brandOriginal = brand.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
              const brandUnits = brand.items.reduce((sum, item) => sum + item.quantity, 0);
              const brandHasDiscount = brandOriginal > brandTotal;
              const deliveryStatus = !shippingReady
                ? {label: 'Загружаем доставку', className: 'bg-gray-100 text-gray-600'}
                : methods.length === 0
                  ? {label: 'Доставка не заполнена', className: 'bg-amber-100 text-amber-700'}
                  : selection.methodId
                    ? {label: 'Доставка выбрана', className: 'bg-green-100 text-green-700'}
                    : {label: 'Выберите доставку', className: 'bg-purple-100 text-purple-700'};

              return (
                <div key={brand.brandId} className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-gray-900 sm:text-lg">{brand.brandName}</h2>
                      <p className="mt-1 text-xs text-gray-500">
                        {brand.items.length} поз. · {brandUnits} шт.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${deliveryStatus.className}`}>
                        {deliveryStatus.label}
                      </span>
                      <div className="text-right">
                        <Money value={brandTotal} className="text-base font-bold text-purple-600"/>
                        {brandHasDiscount && (
                          <Money value={brandOriginal} showIcon={false} className="ml-2 text-xs text-gray-400 line-through"/>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    {visibleItems.map((item) => {
                      const discountPercent = calculateDiscountPercent(Number(item.price), Number(item.finalPrice));
                      const hasDiscount = discountPercent > 0;
                      const productUrl = item.variantId
                        ? `/products/${item.productId}?variantId=${item.variantId}`
                        : `/products/${item.productId}`;

                      return (
                        <div key={item.id} className="flex gap-3 rounded-xl bg-gray-50 p-3">
                          <Link
                            href={productUrl}
                            className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
                            aria-label={`Перейти к товару ${item.title}`}
                          >
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="56px"
                                className="object-cover object-center"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-[0.62rem] font-semibold text-gray-400">
                                Нет фото
                              </span>
                            )}
                          </Link>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <Link href={productUrl} className="line-clamp-2 text-sm font-semibold leading-tight text-gray-900 transition hover:text-purple-600">
                                {item.title}
                              </Link>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="flex-shrink-0 text-gray-400 transition hover:text-red-500"
                                aria-label="Удалить товар"
                              >
                                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                                </svg>
                              </button>
                            </div>
                            {item.variantTitle && (
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {item.variantTitle.split(', ').map((option, idx) => {
                                  const [label, ...valueParts] = option.split(': ');
                                  const value = valueParts.join(': ') || label;

                                  return (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[0.68rem] font-medium text-gray-700 ring-1 ring-gray-200"
                                    >
                                      {valueParts.length > 0 && (
                                        <span className="uppercase tracking-wide text-[0.55rem] text-gray-400">{label}</span>
                                      )}
                                      <span className="text-gray-900">{value}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="px-2.5 py-1 text-sm text-gray-600 transition hover:text-purple-600"
                                >
                                  −
                                </button>
                                <span className="min-w-[1.5rem] text-center text-sm font-medium text-gray-900">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="px-2.5 py-1 text-sm text-gray-600 transition hover:text-purple-600"
                                >
                                  +
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <Money value={item.finalPrice} className="text-sm font-bold text-purple-600"/>
                                {hasDiscount && (
                                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[0.65rem] font-semibold text-rose-600">
                                    -{discountPercent}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {hiddenItemsCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedBrandItems(prev => ({...prev, [brand.brandId]: true}))}
                        className="rounded-xl border border-dashed border-gray-200 py-2 text-sm font-semibold text-gray-600 transition hover:border-purple-200 hover:text-purple-600"
                      >
                        Показать еще {hiddenItemsCount}
                      </button>
                    )}
                    {isExpanded && brand.items.length > VISIBLE_ITEMS_PER_BRAND && (
                      <button
                        type="button"
                        onClick={() => setExpandedBrandItems(prev => ({...prev, [brand.brandId]: false}))}
                        className="self-start text-xs font-semibold text-gray-500 transition hover:text-purple-600"
                      >
                        Свернуть товары
                      </button>
                    )}
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Доставка</p>
                    {!shippingReady ? (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                        Загружаем способы доставки...
                      </div>
                    ) : methods.length > 0 ? (
                      <ShippingMethodPicker
                        methods={methods}
                        selection={selection}
                        errors={shippingErrors[brand.brandId] ?? null}
                        disabled={submitting}
                        variant="select"
                        onChange={(selection) => updateShippingSelection(brand.brandId, selection)}
                      />
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-semibold text-amber-900">
                          Продавец {brand.brandName} не заполнил способы доставки.
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-amber-800">
                          {brand.brandName} свяжется с вами и согласует условия доставки после заказа.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Контактные данные</h2>
              <div className="flex flex-col gap-5">
                <Input
                  {...register("name")}
                  disabled={submitting}
                  variant="bordered"
                  label="Имя"
                  placeholder="Введите ваше имя"
                  size="lg"
                  errorMessage={errors.name?.message}
                  isInvalid={!!errors.name?.message?.length}
                  classNames={compactInputClassNames}
                />
                <Input
                  {...register("phone")}
                  disabled={submitting}
                  variant="bordered"
                  label="Телефон"
                  placeholder="+375 (XX) XXX-XX-XX"
                  size="lg"
                  errorMessage={errors.phone?.message}
                  isInvalid={!!errors.phone?.message?.length}
                  classNames={compactInputClassNames}
                />
                <Input
                  {...register("email")}
                  disabled={submitting}
                  variant="bordered"
                  label="Email"
                  placeholder="example@mail.com"
                  size="lg"
                  errorMessage={errors.email?.message}
                  isInvalid={!!errors.email?.message?.length}
                  classNames={compactInputClassNames}
                />
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Итого</h2>
                {brandsCount > 1 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"/>
                    </svg>
                    {brandsCount} заказа
                  </span>
                )}
              </div>

              {brandsCount > 1 && (
                <div className="mb-4 rounded-lg bg-blue-50 border border-blue-100 p-3">
                  <p className="text-xs text-blue-900 leading-relaxed">
                    Товары разделены по продавцам. Для каждого продавца будет создан отдельный заказ.
                  </p>
                </div>
              )}

              <div className="mb-5 flex flex-col gap-2">
                {itemsByBrand.map((brand) => {
                  const brandTotal = brandItemsTotal(brand.items);
                  const methods = shippingMethodsByBrand[brand.brandId] ?? [];
                  const method = selectedShippingMethod(methods, shippingSelections[brand.brandId]?.methodId);
                  const methodCost = shippingMethodCost(method, brandTotal);

                  return (
                    <div key={brand.brandId} className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate text-gray-700">{brand.brandName}</span>
                        <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.68rem] leading-tight text-gray-500">
                          {!shippingReady ? (
                            <span>Доставка загружается</span>
                          ) : method ? (
                            <>
                              <span className="max-w-full truncate">{method.name}</span>
                              <span aria-hidden="true">·</span>
                              {methodCost !== null ? (
                                <Money value={methodCost} className="font-medium text-gray-700"/>
                              ) : (
                                <span>стоимость согласуется</span>
                              )}
                            </>
                          ) : methods.length > 0 ? (
                            <span>Доставка не выбрана</span>
                          ) : (
                            <span>Доставка согласуется</span>
                          )}
                        </span>
                      </span>
                      <span className="flex-shrink-0 font-semibold text-gray-900">
                        <Money value={brandTotal}/>
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Товары ({totalUnits})</span>
                  <Money value={originalTotal}/>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
                  <span>Доставка</span>
                  <span className="text-right">
                    {shippingSummary.amount !== null ? (
                      <Money value={shippingSummary.amount}/>
                    ) : (
                      shippingSummary.label
                    )}
                  </span>
                </div>
                {shippingSummary.withoutMethods > 0 && (
                  <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                    Без настроенной доставки: {shippingSummary.withoutMethods}. Условия будут согласованы после заказа.
                  </div>
                )}
                {totalDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>Скидка</span>
                    <Money value={-totalDiscount}/>
                  </div>
                )}
                <div className="h-px bg-gray-200"></div>
                <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                  <span>Итого</span>
                  <Money value={checkoutTotal} className="text-purple-600 text-lg font-bold"/>
                </div>
              </div>

              {shippingLoadFailed && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
                  Не удалось загрузить способы доставки.{' '}
                  <button
                    type="button"
                    onClick={() => setShippingRetryNonce(nonce => nonce + 1)}
                    className="font-semibold underline underline-offset-2 hover:text-rose-700"
                  >
                    Повторить
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || cartItems.length === 0 || !shippingReady}
                className="mt-6 hidden w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3.5 text-base font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60 lg:block"
              >
                {submitting ? 'Оформляем заказ...' : 'Оформить заказ'}
              </button>
            </div>

            <div className="rounded-2xl bg-purple-50 p-6 border border-purple-100">
              <div className="flex flex-col gap-3 text-sm text-gray-700">
                <p className="font-semibold text-purple-900">Гарантия безопасности</p>
                <ul className="flex flex-col gap-2 text-xs">
                  <li className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Защита персональных данных</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Связь напрямую с продавцом</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Отслеживание статуса заказа</span>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">{totalUnits} шт. · продавцов: {brandsCount}</p>
                <Money value={checkoutTotal} className="text-lg font-bold text-purple-600"/>
              </div>
              <button
                type="submit"
                disabled={submitting || cartItems.length === 0 || !shippingReady}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Оформляем...' : 'Оформить'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
