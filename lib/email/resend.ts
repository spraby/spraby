import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not defined. Email functionality will be disabled.')
}

export const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key')

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@spraby.com'
export const IS_EMAIL_ENABLED = process.env.RESEND_ENABLED === 'true'
export const SUPPORT_EMAIL = 'support@spraby.com'
