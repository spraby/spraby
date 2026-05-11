'use client'

import Link from "next/link";
import Image from "next/image";
import {useState, useMemo} from "react";
import {useForm} from "react-hook-form"
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup from "yup"
import {Input, Textarea} from "@nextui-org/input";
import Money from "@/theme/snippents/Money";
import {calculateDiscountPercent} from "@/services/utilits";
import {createWithNotifications, sendCustomerOrderSummaryEmail} from "@/services/Orders";
import {format} from "date-fns";
import {useRouter} from "next/navigation";
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

export default function CheckoutPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [completedOrders, setCompletedOrders] = useState<OrderResult[]>([]);
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

  const compactInputClassNames = useMemo(() => ({
    input: "text-sm",
    label: "text-xs font-medium text-gray-500"
  }), []);

  const onSubmit = async (data: any) => {
    if (cartItems.length === 0) return;

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
                  note: data?.description ?? ''
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

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка - Контактные данные */}
          <div className="flex flex-col gap-6 lg:order-2">
            <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Ваш заказ</h2>
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
                    Вы заказываете товары от {brandsCount} продавцов. Будет создано {brandsCount} отдельных заказа.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-6 mb-6">
                {itemsByBrand.map((brand, brandIndex) => (
                  <div key={brand.brandId} className="flex flex-col gap-3">
                    {brandsCount > 1 && (
                      <div className="flex items-center gap-2 pb-2">
                        <div className="h-px flex-1 bg-gray-200"></div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {brand.brandName}
                        </span>
                        <div className="h-px flex-1 bg-gray-200"></div>
                      </div>
                    )}

                    {brand.items.map((item) => {
                      const discountPercent = calculateDiscountPercent(Number(item.price), Number(item.finalPrice));
                      const hasDiscount = discountPercent > 0;

                      // Формируем ссылку на товар с параметром variantId
                      const productUrl = item.variantId
                        ? `/products/${item.productId}?variantId=${item.variantId}`
                        : `/products/${item.productId}`;

                      return (
                        <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 group relative">
                          {/* Кликабельная область */}
                          <Link
                            href={productUrl}
                            className="absolute inset-0 z-0 rounded-xl transition-colors group-hover:bg-gray-100"
                            aria-label={`Перейти к товару ${item.title}`}
                          />

                          {/* Изображение */}
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 z-10 pointer-events-none">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="80px"
                                className="object-cover object-center"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-400">
                                Нет фото
                              </span>
                            )}
                          </div>

                          {/* Контент */}
                          <div className="flex flex-1 flex-col gap-2 z-10 pointer-events-none">
                            <Link
                              href={productUrl}
                              className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-purple-600 transition-colors pointer-events-auto relative z-20"
                            >
                              {item.title}
                            </Link>
                            {item.variantTitle && (
                              <div className="flex flex-wrap gap-1.5">
                                {item.variantTitle.split(', ').map((option, idx) => {
                                  const [label, value] = option.split(': ');
                                  return (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-medium text-gray-700 ring-1 ring-gray-200 sm:text-xs"
                                    >
                                      <span className="uppercase tracking-wide text-[0.55rem] text-gray-400">{label}</span>
                                      <span className="text-gray-900">{value}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-auto pointer-events-auto">
                              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white relative z-20">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateQuantity(item.id, item.quantity - 1);
                                  }}
                                  className="px-3 py-1 text-gray-600 hover:text-purple-600 transition"
                                >
                                  −
                                </button>
                                <span className="text-sm font-medium text-gray-900 min-w-[1.5rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateQuantity(item.id, item.quantity + 1);
                                  }}
                                  className="px-3 py-1 text-gray-600 hover:text-purple-600 transition"
                                >
                                  +
                                </button>
                              </div>
                              <div className="flex flex-wrap items-center justify-end gap-2.5 pointer-events-none">
                                <Money value={item.finalPrice} className="text-purple-600 text-base font-bold"/>
                                {hasDiscount && (
                                  <Money
                                    value={item.price}
                                    showIcon={false}
                                    className="text-gray-400 line-through text-xs"
                                  />
                                )}
                                {hasDiscount && (
                                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">
                                    -{discountPercent}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Кнопка удаления */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition self-start relative z-20 pointer-events-auto"
                            aria-label="Удалить товар"
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Товары ({cartItems.length})</span>
                  <Money value={originalTotal}/>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>Скидка</span>
                    <Money value={-totalDiscount}/>
                  </div>
                )}
                <div className="h-px bg-gray-200"></div>
                <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                  <span>Итого</span>
                  <Money value={totalPrice} className="text-purple-600 text-lg font-bold"/>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || cartItems.length === 0}
                className="w-full mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3.5 text-base font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
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
          </div>

          {/* Правая колонка - Контактные данные */}
          <div className="flex flex-col gap-6 lg:order-1">
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
                <Textarea
                  {...register('description')}
                  disabled={submitting}
                  label="Комментарий к заказу"
                  placeholder="Укажите пожелания по доставке или другую важную информацию"
                  variant="bordered"
                  size="lg"
                  minRows={3}
                  classNames={compactInputClassNames}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
