'use server'
import db from "@/prisma/db.client";
import Prisma, {OrderModel} from "@/prisma/types";
import {
  sendCustomerOrderSummaryEmail as sendCustomerOrderSummaryEmailInternal,
  sendNewOrderNotificationEmail,
  sendOrderConfirmationEmail,
  sendOrderEmails,
} from "@/lib/email/send";

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

  return {
    orderItems,
    totalPrice,
    totalFinalPrice,
    productTitle,
    variantTitle,
    productImage: orderItems[0]?.image,
  }
}

/**
 * Создание заказа (базовая функция)
 * @param params
 */
export async function create(params: Prisma.ordersCreateArgs) {
  return db.orders.create(params)
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
  const order = await db.orders.create(params)

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
    } = buildOrderEmailData(order)

    const discountPercent = totalPrice > totalFinalPrice && totalPrice > 0
      ? Math.round((1 - (totalFinalPrice / totalPrice)) * 100)
      : undefined

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spraby.com'
    // URL для просмотра заказа в панели продавца
    const orderUrl = `${siteUrl}/admin/orders/${order.id}`
    // Публичная ссылка для отслеживания статуса заказа (для покупателя)
    const trackingUrl = `${siteUrl}/purchases/${order.name.replace('#', '')}`

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spraby.com'
    const orderMap = new Map(orders.map(order => [order.id.toString(), order]))
    const orderedList = normalizedIds
      .map(id => orderMap.get(id.toString()))
      .filter((order): order is OrderWithEmailRelations => Boolean(order))

    const summaryOrders = orderedList.map(order => {
      const { orderItems, totalPrice, totalFinalPrice } = buildOrderEmailData(order)
      const totalDiscount = totalPrice > totalFinalPrice ? (totalPrice - totalFinalPrice) : 0

      return {
        brandName: order.Brand.name,
        orderNumber: order.name,
        trackingUrl: `${siteUrl}/purchases/${order.name.replace('#', '')}`,
        items: orderItems,
        totalPrice: totalPrice.toFixed(2),
        totalFinalPrice: totalFinalPrice.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        itemsCount: orderItems.length,
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
