'use server'
import db from "@/prisma/db.client";
import Prisma, {OrderModel} from "@/prisma/types";
import {
  sendCustomerOrderSummaryEmail as sendCustomerOrderSummaryEmailInternal,
  sendNewOrderNotificationEmail,
  sendOrderConfirmationEmail,
  sendOrderEmails,
} from "@/lib/email/send";
import {calculateDiscountPercent} from "@/services/utilits";
import {computeShippingCost, normalizeMerchantFields} from "@/services/shipping";
import {SITE_URL} from "@/lib/config";

type NotificationOptions = {
  sendCustomerEmail?: boolean
  sendSellerEmail?: boolean
  awaitNotifications?: boolean
}

const orderEmailInclude = {
  Customer: true,
  Brand: {
    include: {
      User: true,
    }
  },
  OrderItems: {
    include: {
      Product: {
        include: {
          Images: {
            take: 1,
            orderBy: {
              position: 'asc'
            },
            include: {
              Image: true
            }
          }
        }
      },
      Variant: {
        include: {
          Image: {
            include: {
              Image: true
            }
          }
        }
      },
      Image: {
        include: {
          Image: true
        }
      }
    }
  },
  OrderShippings: {
    take: 1,
  }
} as const

type OrderWithEmailRelations = Prisma.ordersGetPayload<{
  include: typeof orderEmailInclude
}>

const getOrderItemImage = (item: OrderWithEmailRelations['OrderItems'][number]) => {
  if (item.Image?.Image?.src) {
    return `${process.env.AWS_IMAGE_DOMAIN}/${item.Image.Image.src}`
  }
  if (item.Variant?.Image?.Image?.src) {
    return `${process.env.AWS_IMAGE_DOMAIN}/${item.Variant.Image.Image.src}`
  }
  if (item.Product?.Images?.[0]?.Image?.src) {
    return `${process.env.AWS_IMAGE_DOMAIN}/${item.Product.Images[0].Image.src}`
  }
  return undefined
}

const buildOrderEmailData = (order: OrderWithEmailRelations) => {
  const totalPrice = order.OrderItems.reduce((sum, item) => {
    return sum + (Number(item.price) * item.quantity)
  }, 0)

  const totalFinalPrice = order.OrderItems.reduce((sum, item) => {
    return sum + (Number(item.final_price) * item.quantity)
  }, 0)

  const orderItems = order.OrderItems.map(item => ({
    title: item.title,
    variantTitle: item.variant_title || undefined,
    quantity: item.quantity,
    price: Number(item.price).toFixed(2),
    finalPrice: Number(item.final_price).toFixed(2),
    image: getOrderItemImage(item),
  }))

  const firstItem = order.OrderItems[0]
  const productTitle = order.OrderItems.length > 1
    ? `${firstItem.title} и ещё ${order.OrderItems.length - 1} товар(ов)`
    : firstItem.title
  const variantTitle = firstItem.variant_title || undefined

  // Финансовый снапшот заказа. Старый заказ (total NULL) — строк доставки
  // в письме нет, итог из позиций; новый — доставка и итог из колонок orders
  const hasTotals = order.total !== null && order.total !== undefined
  const shippingPrice = !hasTotals
    ? undefined
    : order.shipping_price !== null && order.shipping_price !== undefined
      ? Number(order.shipping_price).toFixed(2)
      : null
  const orderTotal = hasTotals ? Number(order.total).toFixed(2) : undefined

  return {
    orderItems,
    totalPrice,
    totalFinalPrice,
    productTitle,
    variantTitle,
    productImage: orderItems[0]?.image,
    shippingPrice,
    orderTotal,
  }
}

const toMoney = (value: number): string => value.toFixed(2)

/**
 * Сервер — источник правды по деньгам заказа. Клиентские price/final_price
 * перезаписываются ценами вариантов из БД (корзина живёт в localStorage и
 * может быть отредактирована), стоимость доставки считается из
 * merchant_settings выбранного метода, и всё замораживается в колонках
 * orders: subtotal / discount_total / shipping_price / total.
 * shipping_price null — «стоимость согласуется», total тогда без доставки.
 */
async function withServerPricing(params: Prisma.ordersCreateArgs): Promise<Prisma.ordersCreateArgs> {
  const data: any = {...params.data}

  const rawItems = data.OrderItems?.createMany?.data
  const items: any[] = Array.isArray(rawItems) ? rawItems.map(item => ({...item})) : rawItems ? [{...rawItems}] : []
  if (!items.length) return params

  const variantIds = Array.from(new Set(
    items.filter(item => item.variant_id != null).map(item => BigInt(item.variant_id))
  ))
  const variants = variantIds.length
    ? await db.variants.findMany({where: {id: {in: variantIds}}})
    : []
  const variantById = new Map(variants.map(variant => [variant.id.toString(), variant]))

  const priced = items.map(item => {
    const variant = item.variant_id != null
      ? variantById.get(BigInt(item.variant_id).toString())
      : undefined

    if (!variant) {
      // Позиции без варианта не создаются текущей витриной; сюда можно попасть
      // только со старой localStorage-корзиной или если вариант удалили —
      // не роняем заказ, но цену с клиента оставляем осознанно, с warning в лог
      console.warn('[ORDER] Variant not found for order item, keeping client price', {
        product_id: `${item.product_id ?? ''}`,
        variant_id: `${item.variant_id ?? ''}`,
      })
      return item
    }

    return {
      ...item,
      price: toMoney(Number(variant.price)),
      final_price: toMoney(Number(variant.final_price ?? variant.price)),
    }
  })

  const subtotal = priced.reduce((sum, item) => sum + Number(item.final_price) * (item.quantity ?? 1), 0)
  const discountTotal = priced.reduce((sum, item) => {
    return sum + Math.max(0, Number(item.price) - Number(item.final_price)) * (item.quantity ?? 1)
  }, 0)

  const rawShippings = data.OrderShippings?.createMany?.data
  const shippings: any[] = Array.isArray(rawShippings) ? rawShippings : rawShippings ? [rawShippings] : []
  const shippingMethodId = shippings[0]?.shipping_method_id

  let shippingPrice: number | null = null
  if (shippingMethodId != null) {
    const method = await db.shipping_methods.findUnique({where: {id: BigInt(shippingMethodId)}})
    shippingPrice = method
      ? computeShippingCost(normalizeMerchantFields(method.merchant_settings), subtotal)
      : null
  }

  data.OrderItems = {
    ...data.OrderItems,
    createMany: {...data.OrderItems.createMany, data: Array.isArray(rawItems) ? priced : priced[0]},
  }
  data.subtotal = toMoney(subtotal)
  data.discount_total = toMoney(discountTotal)
  data.shipping_price = shippingPrice === null ? null : toMoney(shippingPrice)
  data.total = toMoney(subtotal + (shippingPrice ?? 0))

  return {...params, data}
}

/**
 * Создание заказа (базовая функция)
 * @param params
 */
export async function create(params: Prisma.ordersCreateArgs) {
  return db.orders.create(await withServerPricing(params))
}

/**
 * Создание заказа с отправкой email-уведомлений
 * @param params - параметры создания заказа
 */
export async function createWithNotifications(
  params: Prisma.ordersCreateArgs,
  options?: NotificationOptions
) {
  // Создаем заказ
  const order = await db.orders.create(await withServerPricing(params))

  if (options?.awaitNotifications) {
    try {
      await sendOrderEmailNotifications(order.id, options)
    } catch (error) {
      console.error('[ORDER] Failed to send email notifications for order:', order.id, error)
    }
  } else {
    // Асинхронно отправляем email-уведомления (не блокируем ответ)
    sendOrderEmailNotifications(order.id, options).catch((error) => {
      console.error('[ORDER] Failed to send email notifications for order:', order.id, error)
    })
  }

  return order
}

/**
 * Отправка email-уведомлений для заказа
 * @param orderId - ID заказа
 */
async function sendOrderEmailNotifications(orderId: bigint, options: NotificationOptions = {}) {
  try {
    // Получаем полные данные заказа с релейшнами
    const order = await db.orders.findUnique({
      where: { id: orderId },
      include: orderEmailInclude
    })

    if (!order || !order.Customer || !order.Brand) {
      console.error('[ORDER] Missing order data for email notifications:', orderId)
      return
    }

    const shipping = order.OrderShippings[0]
    if (!shipping) {
      console.error('[ORDER] Missing shipping data for email notifications:', orderId)
      return
    }

    const sendCustomerEmail = options.sendCustomerEmail !== false
    const sendSellerEmail = options.sendSellerEmail !== false

    // Проверяем наличие email продавца
    const sellerEmail = order.Brand.User?.email
    const shouldRedirectSellerEmail = process.env.SELLER_EMAIL_TO_CUSTOMER === 'true'
    const sellerNotificationEmail = sendSellerEmail
      ? (shouldRedirectSellerEmail ? order.Customer.email : sellerEmail)
      : undefined

    console.log('[ORDER] Seller notification debug:', {
      sellerEmail,
      shouldRedirectSellerEmail,
      sellerNotificationEmail,
      sendCustomerEmail,
      sendSellerEmail,
    })

    if (!sellerEmail && !shouldRedirectSellerEmail) {
      console.warn('[ORDER] Brand has no associated user email, skipping seller notification:', order.Brand.name)
    }
    if (!sellerEmail && shouldRedirectSellerEmail) {
      console.warn('[ORDER] Brand has no associated user email, redirecting seller notification to customer for tests:', order.Brand.name)
    }

    const {
      orderItems,
      totalPrice,
      totalFinalPrice,
      productTitle,
      variantTitle,
      productImage,
      shippingPrice,
      orderTotal,
    } = buildOrderEmailData(order)

    const calculatedDiscount = calculateDiscountPercent(totalPrice, totalFinalPrice)
    const discountPercent = calculatedDiscount > 0 ? calculatedDiscount : undefined

    // URL для просмотра заказа в панели продавца
    const orderUrl = `${SITE_URL}/admin/orders/${order.id}`
    // Публичная ссылка для отслеживания статуса заказа (для покупателя)
    const trackingUrl = `${SITE_URL}/purchases/${order.name.replace('#', '')}`

    // Отправляем письма
    let customerResult: { success: boolean; skipped?: boolean; data?: unknown; error?: unknown; disabled?: boolean } = { success: true, skipped: true }
    let sellerResult: { success: boolean; skipped?: boolean; data?: unknown; error?: unknown; disabled?: boolean } = { success: true, skipped: true }

    if (sendCustomerEmail && sendSellerEmail && sellerNotificationEmail) {
      const result = await sendOrderEmails(
        // Письмо покупателю
        {
          to: order.Customer.email,
          customerName: shipping.name,
          orderNumber: order.name,
          productTitle,
          variantTitle,
          price: totalPrice.toFixed(2),
          finalPrice: totalFinalPrice.toFixed(2),
          discountPercent,
          brandName: order.Brand.name,
          orderItems,
          trackingUrl,
          customerEmail: order.Customer.email,
          customerPhone: shipping.phone,
          note: shipping.note || undefined,
          productImage,
          shippingPrice,
          total: orderTotal,
        },
        // Письмо продавцу
        {
          to: sellerNotificationEmail,
          brandName: order.Brand.name,
          orderNumber: order.name,
          customerName: shipping.name,
          customerEmail: order.Customer.email,
          customerPhone: shipping.phone,
          productTitle,
          variantTitle,
          price: totalPrice.toFixed(2),
          finalPrice: totalFinalPrice.toFixed(2),
          discountPercent,
          orderItems,
          trackingUrl,
          note: shipping.note || undefined,
          orderUrl,
          productImage,
          shippingPrice,
          total: orderTotal,
        }
      )
      customerResult = result.customer
      sellerResult = result.seller
    } else {
      if (sendSellerEmail && sellerNotificationEmail) {
        sellerResult = await sendNewOrderNotificationEmail({
          to: sellerNotificationEmail,
          brandName: order.Brand.name,
          orderNumber: order.name,
          customerName: shipping.name,
          customerEmail: order.Customer.email,
          customerPhone: shipping.phone,
          productTitle,
          variantTitle,
          price: totalPrice.toFixed(2),
          finalPrice: totalFinalPrice.toFixed(2),
          discountPercent,
          orderItems,
          trackingUrl,
          note: shipping.note || undefined,
          orderUrl,
          productImage,
          shippingPrice,
          total: orderTotal,
        })
      }

      if (sendCustomerEmail) {
        customerResult = await sendOrderConfirmationEmail({
          to: order.Customer.email,
          customerName: shipping.name,
          orderNumber: order.name,
          productTitle,
          variantTitle,
          price: totalPrice.toFixed(2),
          finalPrice: totalFinalPrice.toFixed(2),
          discountPercent,
          brandName: order.Brand.name,
          orderItems,
          trackingUrl,
          customerEmail: order.Customer.email,
          customerPhone: shipping.phone,
          note: shipping.note || undefined,
          productImage,
          shippingPrice,
          total: orderTotal,
        })
      }
    }

    console.log('[ORDER] Email notifications sent for order:', order.name, {
      customer: customerResult.success,
      seller: sellerResult.success,
    })
  } catch (error) {
    console.error('[ORDER] Error sending email notifications:', error)
    throw error
  }
}

/**
 * Отправка одного суммарного письма покупателю по нескольким заказам
 */
export async function sendCustomerOrderSummaryEmail(orderIds: Array<string | bigint>) {
  try {
    if (!orderIds.length) {
      console.warn('[ORDER] No order IDs provided for summary email')
      return { success: false, error: 'No orders' }
    }

    const normalizedIds = orderIds.map((id) => typeof id === 'bigint' ? id : BigInt(id))
    const orders = await db.orders.findMany({
      where: { id: { in: normalizedIds } },
      include: orderEmailInclude,
    })

    if (!orders.length) {
      console.warn('[ORDER] No orders found for summary email:', orderIds)
      return { success: false, error: 'Orders not found' }
    }

    const firstOrder = orders[0]
    if (!firstOrder.Customer || !firstOrder.Brand) {
      console.error('[ORDER] Missing order data for summary email:', orderIds)
      return { success: false, error: 'Missing order data' }
    }

    const shipping = firstOrder.OrderShippings[0]
    if (!shipping) {
      console.error('[ORDER] Missing shipping data for summary email:', orderIds)
      return { success: false, error: 'Missing shipping data' }
    }

    const orderMap = new Map(orders.map(order => [order.id.toString(), order]))
    const orderedList = normalizedIds
      .map(id => orderMap.get(id.toString()))
      .filter((order): order is OrderWithEmailRelations => Boolean(order))

    const summaryOrders = orderedList.map(order => {
      const { orderItems, totalPrice, totalFinalPrice, shippingPrice, orderTotal } = buildOrderEmailData(order)
      const totalDiscount = totalPrice > totalFinalPrice ? (totalPrice - totalFinalPrice) : 0

      return {
        brandName: order.Brand.name,
        orderNumber: order.name,
        trackingUrl: `${SITE_URL}/purchases/${order.name.replace('#', '')}`,
        items: orderItems,
        totalPrice: totalPrice.toFixed(2),
        totalFinalPrice: totalFinalPrice.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        itemsCount: orderItems.length,
        shippingPrice,
        total: orderTotal,
      }
    })

    return await sendCustomerOrderSummaryEmailInternal({
      to: firstOrder.Customer.email,
      customerName: shipping.name,
      customerEmail: firstOrder.Customer.email,
      customerPhone: shipping.phone,
      note: shipping.note || undefined,
      orders: summaryOrders,
    })
  } catch (error) {
    console.error('[ORDER] Error sending summary email:', error)
    return { success: false, error }
  }
}

/**
 * Поиск заказа
 * @param params
 */
export async function findFirst(params?: Prisma.ordersFindFirstArgs): Promise<OrderModel | null> {
  return db.orders.findFirst(params)
}
