'use server'

import { resend, FROM_EMAIL, IS_EMAIL_ENABLED } from './resend'
import OrderConfirmation from './templates/OrderConfirmation'
import NewOrderNotification from './templates/NewOrderNotification'
import { render } from '@react-email/components'
import * as React from 'react'

export interface OrderConfirmationParams {
  to: string
  customerName: string
  orderNumber: string
  productTitle: string
  variantTitle?: string
  price: string
  finalPrice: string
  brandName: string
  customerEmail: string
  customerPhone: string
  note?: string
  productImage?: string
}

export interface NewOrderNotificationParams {
  to: string
  brandName: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  productTitle: string
  variantTitle?: string
  price: string
  finalPrice: string
  note?: string
  orderUrl: string
  productImage?: string
}

/**
 * Отправка письма-подтверждения заказа покупателю
 */
export async function sendOrderConfirmationEmail(params: OrderConfirmationParams) {
  if (!IS_EMAIL_ENABLED) {
    console.log('[EMAIL DISABLED] Would send order confirmation to:', params.to)
    return { success: true, disabled: true }
  }

  try {
    const emailHtml = await render(React.createElement(OrderConfirmation, params))

    const { data, error } = await resend.emails.send({
      from: `Spraby <${FROM_EMAIL}>`,
      to: params.to,
      subject: `✓ Ваш заказ ${params.orderNumber} получен`,
      html: emailHtml,
    })

    if (error) {
      console.error('[RESEND ERROR] Order confirmation:', error)
      return { success: false, error }
    }

    console.log('[EMAIL SENT] Order confirmation to:', params.to, '- ID:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('[EMAIL ERROR] Order confirmation:', error)
    return { success: false, error }
  }
}

/**
 * Отправка уведомления о новом заказе продавцу
 */
export async function sendNewOrderNotificationEmail(params: NewOrderNotificationParams) {
  if (!IS_EMAIL_ENABLED) {
    console.log('[EMAIL DISABLED] Would send new order notification to:', params.to)
    return { success: true, disabled: true }
  }

  try {
    const emailHtml = await render(React.createElement(NewOrderNotification, params))

    const { data, error } = await resend.emails.send({
      from: `Spraby Notifications <${FROM_EMAIL}>`,
      to: params.to,
      subject: `🛍️ Новый заказ ${params.orderNumber}`,
      html: emailHtml,
    })

    if (error) {
      console.error('[RESEND ERROR] New order notification:', error)
      return { success: false, error }
    }

    console.log('[EMAIL SENT] New order notification to:', params.to, '- ID:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('[EMAIL ERROR] New order notification:', error)
    return { success: false, error }
  }
}

/**
 * Отправка обоих писем (покупателю и продавцу) параллельно
 */
export async function sendOrderEmails(
  customerParams: OrderConfirmationParams,
  sellerParams: NewOrderNotificationParams
) {
  const [customerResult, sellerResult] = await Promise.allSettled([
    sendOrderConfirmationEmail(customerParams),
    sendNewOrderNotificationEmail(sellerParams),
  ])

  return {
    customer: customerResult.status === 'fulfilled' ? customerResult.value : { success: false, error: customerResult.reason },
    seller: sellerResult.status === 'fulfilled' ? sellerResult.value : { success: false, error: sellerResult.reason },
  }
}
