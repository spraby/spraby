'use server'

import { resend, FROM_EMAIL, IS_EMAIL_ENABLED } from './resend'
import { enqueueEmailSend } from './queue'
import { EmailOrderItem, EmailOrderSummary } from './types'
import OrderConfirmation from './templates/OrderConfirmation'
import OrderSummary from './templates/OrderSummary'
import NewOrderNotification from './templates/NewOrderNotification'
import PasswordReset from './templates/PasswordReset'
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
  discountPercent?: number
  brandName: string
  orderItems?: EmailOrderItem[]
  trackingUrl?: string
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
  discountPercent?: number
  orderItems?: EmailOrderItem[]
  trackingUrl?: string
  note?: string
  orderUrl: string
  productImage?: string
}

export interface CustomerOrderSummaryParams {
  to: string
  customerName: string
  customerEmail: string
  customerPhone: string
  note?: string
  orders: EmailOrderSummary[]
}

/**
 * Отправка письма-подтверждения заказа покупателю
 */
export async function sendOrderConfirmationEmail(params: OrderConfirmationParams) {
  if (!IS_EMAIL_ENABLED) {
    console.log('[EMAIL DISABLED] Would send order confirmation to:', params.to)
    return { success: true, disabled: true }
  }

  return enqueueEmailSend(async () => {
    try {
      const emailHtml = await render(React.createElement(OrderConfirmation, params))

      const { data, error } = await resend.emails.send({
        from: `spraby <${FROM_EMAIL}>`,
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
  })
}

/**
 * Отправка суммарного письма покупателю по нескольким заказам
 */
export async function sendCustomerOrderSummaryEmail(params: CustomerOrderSummaryParams) {
  if (!IS_EMAIL_ENABLED) {
    console.log('[EMAIL DISABLED] Would send customer order summary to:', params.to)
    return { success: true, disabled: true }
  }

  return enqueueEmailSend(async () => {
    try {
      const emailHtml = await render(React.createElement(OrderSummary, params))

      const { data, error } = await resend.emails.send({
        from: `spraby <${FROM_EMAIL}>`,
        to: params.to,
        subject: '✓ Ваш заказ на spraby получен',
        html: emailHtml,
      })

      if (error) {
        console.error('[RESEND ERROR] Customer order summary:', error)
        return { success: false, error }
      }

      console.log('[EMAIL SENT] Customer order summary to:', params.to, '- ID:', data?.id)
      return { success: true, data }
    } catch (error) {
      console.error('[EMAIL ERROR] Customer order summary:', error)
      return { success: false, error }
    }
  })
}

/**
 * Отправка уведомления о новом заказе продавцу
 */
export async function sendNewOrderNotificationEmail(params: NewOrderNotificationParams) {
  if (!IS_EMAIL_ENABLED) {
    console.log('[EMAIL DISABLED] Would send new order notification to:', params.to)
    return { success: true, disabled: true }
  }

  return enqueueEmailSend(async () => {
    try {
      const emailHtml = await render(React.createElement(NewOrderNotification, params))

      const { data, error } = await resend.emails.send({
        from: `spraby <${FROM_EMAIL}>`,
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
  })
}

/**
 * Отправка обоих писем (покупателю и продавцу) параллельно
 */
export async function sendOrderEmails(
  customerParams: OrderConfirmationParams,
  sellerParams: NewOrderNotificationParams
) {
  let sellerResult
  let customerResult

  try {
    sellerResult = await sendNewOrderNotificationEmail(sellerParams)
  } catch (error) {
    sellerResult = { success: false, error }
  }

  try {
    customerResult = await sendOrderConfirmationEmail(customerParams)
  } catch (error) {
    customerResult = { success: false, error }
  }

  return {
    customer: customerResult,
    seller: sellerResult,
  }
}

export interface PasswordResetEmailParams {
  to: string
  brandName: string
  resetCode: string
  expiresInMinutes?: number
}

/**
 * Отправка письма для сброса пароля
 */
export async function sendPasswordResetEmail(params: PasswordResetEmailParams) {
  if (!IS_EMAIL_ENABLED) {
    console.log('[EMAIL DISABLED] Would send password reset to:', params.to)
    return { success: true, disabled: true }
  }

  return enqueueEmailSend(async () => {
    try {
      const emailHtml = await render(React.createElement(PasswordReset, {
        brandName: params.brandName,
        resetCode: params.resetCode,
        expiresInMinutes: params.expiresInMinutes ?? 30,
      }))

      const { data, error } = await resend.emails.send({
        from: `spraby <${FROM_EMAIL}>`,
        to: params.to,
        subject: '🔐 Код для сброса пароля',
        html: emailHtml,
      })

      if (error) {
        console.error('[RESEND ERROR] Password reset:', error)
        return { success: false, error }
      }

      console.log('[EMAIL SENT] Password reset to:', params.to, '- ID:', data?.id)
      return { success: true, data }
    } catch (error) {
      console.error('[EMAIL ERROR] Password reset:', error)
      return { success: false, error }
    }
  })
}
