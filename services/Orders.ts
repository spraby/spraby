'use server'
import db from "@/prisma/db.client";
import Prisma, {OrderModel} from "@/prisma/types";
import {sendOrderEmails, sendOrderConfirmationEmail} from "@/lib/email/send";

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
export async function createWithNotifications(params: Prisma.ordersCreateArgs) {
  // Создаем заказ
  const order = await db.orders.create(params)

  // Асинхронно отправляем email-уведомления (не блокируем ответ)
  sendOrderEmailNotifications(order.id).catch((error) => {
    console.error('[ORDER] Failed to send email notifications for order:', order.id, error)
  })

  return order
}

/**
 * Отправка email-уведомлений для заказа
 * @param orderId - ID заказа
 */
async function sendOrderEmailNotifications(orderId: bigint) {
  try {
    // Получаем полные данные заказа с релейшнами
    const order = await db.orders.findUnique({
      where: { id: orderId },
      include: {
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
      }
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

    // Проверяем наличие email продавца
    const sellerEmail = order.Brand.User?.email
    const shouldRedirectSellerEmail = process.env.SELLER_EMAIL_TO_CUSTOMER === 'true'
    const sellerNotificationEmail = shouldRedirectSellerEmail ? order.Customer.email : sellerEmail

    console.log('[ORDER] Seller notification debug:', {
      sellerEmail,
      shouldRedirectSellerEmail,
      sellerNotificationEmail,
    })

    if (!sellerEmail && !shouldRedirectSellerEmail) {
      console.warn('[ORDER] Brand has no associated user email, skipping seller notification:', order.Brand.name)
    }
    if (!sellerEmail && shouldRedirectSellerEmail) {
      console.warn('[ORDER] Brand has no associated user email, redirecting seller notification to customer for tests:', order.Brand.name)
    }

    // Вычисляем суммарную цену и финальную цену
    const totalPrice = order.OrderItems.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity)
    }, 0)

    const totalFinalPrice = order.OrderItems.reduce((sum, item) => {
      return sum + (Number(item.final_price) * item.quantity)
    }, 0)

    const discountPercent = totalPrice > totalFinalPrice && totalPrice > 0
      ? Math.round((1 - (totalFinalPrice / totalPrice)) * 100)
      : undefined

    // Формируем заголовки товаров
    const productTitles = order.OrderItems.map(item => {
      const variantInfo = item.variant_title ? ` (${item.variant_title})` : ''
      const quantity = item.quantity > 1 ? ` x${item.quantity}` : ''
      return `${item.title}${variantInfo}${quantity}`
    }).join(', ')

    // Для простоты берем первый товар (или можно объединить)
    const firstItem = order.OrderItems[0]
    const productTitle = order.OrderItems.length > 1
      ? `${firstItem.title} и ещё ${order.OrderItems.length - 1} товар(ов)`
      : firstItem.title
    const variantTitle = firstItem.variant_title || undefined

    // Получаем изображение товара (приоритет: image_id из order_item -> variant image -> первое фото продукта)
    let productImage: string | undefined

    if (firstItem.Image?.Image?.src) {
      // Если в заказе сохранено конкретное изображение (это изображение, которое было показано при оформлении заказа)
      productImage = `${process.env.AWS_IMAGE_DOMAIN}/${firstItem.Image.Image.src}`
    } else if (firstItem.Variant?.Image?.Image?.src) {
      // Если есть изображение варианта
      productImage = `${process.env.AWS_IMAGE_DOMAIN}/${firstItem.Variant.Image.Image.src}`
    } else if (firstItem.Product?.Images?.[0]?.Image?.src) {
      // Иначе берем первое изображение продукта
      productImage = `${process.env.AWS_IMAGE_DOMAIN}/${firstItem.Product.Images[0].Image.src}`
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spraby.com'
    // URL для просмотра заказа в панели продавца
    const orderUrl = `${siteUrl}/admin/orders/${order.id}`
    // Публичная ссылка для отслеживания статуса заказа (для покупателя)
    const trackingUrl = `${siteUrl}/purchases/${order.name.replace('#', '')}`

    // Отправляем письма
    // Если у продавца нет email, отправляем только покупателю
    const result = sellerNotificationEmail
      ? await sendOrderEmails(
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
            trackingUrl,
            note: shipping.note || undefined,
            orderUrl,
            productImage,
          }
        )
      : {
          customer: await sendOrderConfirmationEmail({
            to: order.Customer.email,
            customerName: shipping.name,
            orderNumber: order.name,
            productTitle,
            variantTitle,
            price: totalPrice.toFixed(2),
            finalPrice: totalFinalPrice.toFixed(2),
            discountPercent,
            brandName: order.Brand.name,
            trackingUrl,
            customerEmail: order.Customer.email,
            customerPhone: shipping.phone,
            note: shipping.note || undefined,
            productImage,
          }),
          seller: { success: false, skipped: true }
        }

    console.log('[ORDER] Email notifications sent for order:', order.name, {
      customer: result.customer.success,
      seller: result.seller.success,
    })
  } catch (error) {
    console.error('[ORDER] Error sending email notifications:', error)
    throw error
  }
}

/**
 * Поиск заказа
 * @param params
 */
export async function findFirst(params?: Prisma.ordersFindFirstArgs): Promise<OrderModel | null> {
  return db.orders.findFirst(params)
}
