import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Hr,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Img,
} from '@react-email/components'
import { EmailOrderItem } from '../types'

interface NewOrderNotificationProps {
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

export default function NewOrderNotification({
  brandName,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  productTitle,
  variantTitle,
  price,
  finalPrice,
  note,
  orderUrl,
  productImage,
  trackingUrl,
  orderItems,
}: NewOrderNotificationProps) {
  const cleanedPhone = customerPhone.replace(/\D/g, '')
  const telegramUrl = cleanedPhone ? `http://t.me/+${cleanedPhone}` : undefined
  const viberUrl = cleanedPhone ? `viber://chat?number=%2B${cleanedPhone}` : undefined

  const items = orderItems && orderItems.length > 0
    ? orderItems
    : [{
        title: productTitle,
        variantTitle,
        quantity: 1,
        price,
        finalPrice,
        image: productImage,
      }]
  const itemsCount = items.length
  const totalOriginal = Number(price)
  const totalFinal = Number(finalPrice)
  const totalDiscount = totalOriginal > totalFinal ? totalOriginal - totalFinal : 0
  const totalOriginalText = totalOriginal.toFixed(2)
  const totalFinalText = totalFinal.toFixed(2)
  const totalDiscountText = totalDiscount.toFixed(2)

  const getVariantOptions = (value?: string) => (
    value
      ? value.split(', ').map(option => {
          const [label, optionValue] = option.split(': ')
          return { label, value: optionValue }
        })
      : []
  )

  return (
    <Html>
      <Head />
      <Preview>Новый заказ {orderNumber} для {brandName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>spraby</Heading>
            <Text style={tagline}>маркетплейс авторских товаров</Text>
          </Section>

          {/* Alert */}
          <Section style={alertSection}>
            <Text style={alertIcon}>🛍️</Text>
            <Heading style={h1}>Новый заказ!</Heading>
            <Text style={orderNumberStyle}>Заказ {orderNumber}</Text>
          </Section>

          {/* Brand Greeting */}
          <Section style={section}>
            <Text style={greeting}>Здравствуйте, {brandName}!</Text>
            <Text style={text}>
              Поступил новый заказ на маркетплейсе spraby. Пожалуйста, свяжитесь с покупателем в ближайшее время.
            </Text>
          </Section>

          {/* Product Details */}
          <Section style={productSection}>
            <Heading style={sectionTitle}>📦 Детали заказа</Heading>
            {items.map((item, index) => {
              const priceValue = Number(item.price)
              const finalPriceValue = Number(item.finalPrice)
              const hasDiscount = priceValue > finalPriceValue
              const discountPercent = hasDiscount && priceValue > 0
                ? Math.round((1 - (finalPriceValue / priceValue)) * 100)
                : 0
              const variantOptions = getVariantOptions(item.variantTitle)
              const cardStyle = index < items.length - 1 ? productCardWithSpacing : productCard

              return (
                <div style={cardStyle} key={`${item.title}-${index}`}>
                  <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                    <tr>
                      {item.image && (
                        <td style={{width: '100px', paddingRight: '16px', verticalAlign: 'top'}}>
                          <Img
                            src={item.image}
                            alt={item.title}
                            width="100"
                            height="100"
                            style={{
                              borderRadius: '8px',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        </td>
                      )}
                      <td style={{verticalAlign: 'top'}}>
                        <Text style={productTitleStyle}>{item.title}</Text>

                        {item.quantity > 1 && (
                          <Text style={quantityText}>Количество: {item.quantity}</Text>
                        )}

                        {variantOptions.length > 0 && (
                          <div style={{marginTop: '12px', marginBottom: '12px'}}>
                            {variantOptions.map((option, idx) => (
                              <span
                                key={idx}
                                style={{
                                  display: 'inline-block',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '9999px',
                                  padding: '4px 12px',
                                  marginRight: '6px',
                                  marginBottom: '6px',
                                  fontSize: '12px',
                                }}
                              >
                                <span style={{
                                  color: '#9ca3af',
                                  textTransform: 'uppercase',
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  letterSpacing: '0.05em',
                                }}>
                                  {option.label}
                                </span>
                                {' '}
                                <span style={{
                                  color: '#1f2937',
                                  fontWeight: '500',
                                }}>
                                  {option.value}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}

                        <div style={priceContainerNew}>
                          {hasDiscount && (
                            <Text style={oldPrice}>{item.price} BYN</Text>
                          )}
                          <span style={finalPriceGroupNew}>
                            <Text style={finalPriceText}>{item.finalPrice} BYN</Text>
                            {hasDiscount && discountPercent > 0 && (
                              <span style={discountBadge}>-{discountPercent}%</span>
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              )
            })}

            <div style={totalsSection}>
              <table cellPadding="0" cellSpacing="0" border={0} width="100%" style={totalsTable}>
                <tr>
                  <td style={totalsLabel}>Товары ({itemsCount})</td>
                  <td style={totalsValue}>{totalOriginalText} BYN</td>
                </tr>
                {totalDiscount > 0 && (
                  <tr>
                    <td style={totalsDiscountLabel}>Скидка</td>
                    <td style={totalsDiscountValue}>-{totalDiscountText} BYN</td>
                  </tr>
                )}
              </table>
              <div style={totalsDivider} />
              <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                <tr>
                  <td style={totalsTotalLabel}>Итого</td>
                  <td style={totalsTotalValue}>{totalFinalText} BYN</td>
                </tr>
              </table>
            </div>
          </Section>

                    {/* Customer Info */}
          <Section style={customerSection}>
            <Heading style={sectionTitle}>📋 Информация о покупателе</Heading>
            <div style={infoCard}>
              <Row style={infoRow}>
                <Column style={infoLabel}>Имя:</Column>
                <Column style={infoValue}>{customerName}</Column>
              </Row>
              <Row style={infoRow}>
                <Column style={infoLabel}>Email:</Column>
                <Column>
                  <a href={`mailto:${customerEmail}`} style={emailLink}>
                    {customerEmail}
                  </a>
                </Column>
              </Row>
              <Row style={infoRow}>
                <Column style={infoLabel}>Телефон:</Column>
                <Column>
                  <a href={`tel:${customerPhone}`} style={phoneLink}>
                    {customerPhone}
                  </a>
                </Column>
              </Row>
              {cleanedPhone && (
                <Row style={infoRow}>
                  <Column style={infoLabel}>Telegram:</Column>
                  <Column>
                    <a href={telegramUrl} style={telegramLink}>
                      {telegramUrl}
                    </a>
                  </Column>
                </Row>
              )}
              {cleanedPhone && (
                <Row style={infoRow}>
                  <Column style={infoLabel}>Viber:</Column>
                  <Column>
                    <span style={viberUrlText}>{viberUrl}</span>
                  </Column>
                </Row>
              )}
            </div>
          </Section>

          {/* Customer Note */}
          {note && (
            <Section style={noteSection}>
              <Heading style={sectionTitle}>💬 Комментарий покупателя</Heading>
              <div style={noteCard}>
                <Text style={noteText}>{note}</Text>
              </div>
            </Section>
          )}

          <Hr style={hr} />

          {/* Action Required */}
          <Section style={actionSection}>
            <Heading style={sectionTitle}>⚡ Требуется действие</Heading>
            <div style={actionList}>
              <div style={actionItem}>
                <span style={checkboxIcon}>□</span>
                <Text style={actionText}>Свяжитесь с покупателем для подтверждения заказа</Text>
              </div>
              <div style={actionItem}>
                <span style={checkboxIcon}>□</span>
                <Text style={actionText}>Уточните детали доставки</Text>
              </div>
              <div style={actionItem}>
                <span style={checkboxIcon}>□</span>
                <Text style={actionText}>Согласуйте способ оплаты</Text>
              </div>
            </div>

            <div style={urlBox}>
              <Text style={urlLabel}>Ссылка на заказ:</Text>
              <Text style={urlText}>{orderUrl}</Text>
            </div>

            {trackingUrl && (
              <div style={urlBox}>
                <Text style={urlLabel}>Статус для покупателя:</Text>
                <Text style={urlText}>{trackingUrl}</Text>
              </div>
            )}
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Это автоматическое уведомление. Пожалуйста, не отвечайте на это письмо.
            </Text>
            <Text style={footerText}>
              По вопросам работы платформы:{' '}
              <a href="mailto:support@spraby.com" style={link}>support@spraby.com</a>
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} Spraby. Все права защищены.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f6f9',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#ffffff',
  padding: '32px 24px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e5e7eb',
}

const logo = {
  color: '#7c3aed',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  margin: '0',
  letterSpacing: '-0.5px',
}

const tagline = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '12px 0 0 0',
  fontWeight: '400',
}

const alertSection = {
  textAlign: 'center' as const,
  padding: '40px 24px 32px',
  backgroundColor: '#fef3c7',
  borderBottom: '3px solid #f59e0b',
}

const alertIcon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
  lineHeight: '1',
}

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
  lineHeight: '1.2',
}

const orderNumberStyle = {
  color: '#78350f',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
  backgroundColor: '#fef3c7',
  padding: '8px 16px',
  borderRadius: '6px',
  display: 'inline-block',
}

const section = {
  padding: '24px',
}

const greeting = {
  color: '#1f2937',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px 0',
  fontWeight: '500',
}

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0',
}

const sectionTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
}

const customerSection = {
  padding: '24px',
  backgroundColor: '#ffffff',
}

const infoCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #dbeafe',
  borderRadius: '12px',
  padding: '20px',
}

const infoRow = {
  marginBottom: '12px',
}

const infoLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  width: '100px',
  paddingRight: '12px',
}

const infoValue = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '500',
}

const emailLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
}

const phoneLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
}

const telegramLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: '600',
  wordBreak: 'break-all' as const,
}

const viberUrlText = {
  color: '#1f2937',
  fontSize: '13px',
  fontFamily: 'monospace',
  wordBreak: 'break-all' as const,
}

const productSection = {
  padding: '24px',
}

const productCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '20px',
}

const productCardWithSpacing = {
  ...productCard,
  marginBottom: '16px',
}

const productTitleStyle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
}

const quantityText = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0 0 8px 0',
}

const priceContainerNew = {
  display: 'flex',
  alignItems: 'center',
  marginTop: '12px',
}

const finalPriceGroupNew = {
  display: 'inline-flex',
  alignItems: 'center',
}

const oldPrice = {
  color: '#9ca3af',
  fontSize: '16px',
  textDecoration: 'line-through',
  margin: '0 12px 0 0',
}

const finalPriceText = {
  color: '#7c3aed',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
}

const discountBadge = {
  backgroundColor: '#ffe4e6',
  color: '#e11d48',
  padding: '4px 10px',
  borderRadius: '9999px',
  fontSize: '12px',
  fontWeight: '700' as const,
  marginLeft: '10px',
  display: 'inline-block',
}

const totalsSection = {
  borderTop: '1px solid #e5e7eb',
  marginTop: '16px',
  paddingTop: '16px',
}

const totalsTable = {
  marginBottom: '12px',
}

const totalsLabel = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'left' as const,
  paddingBottom: '8px',
}

const totalsValue = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'right' as const,
  paddingBottom: '8px',
}

const totalsDiscountLabel = {
  color: '#16a34a',
  fontSize: '14px',
  textAlign: 'left' as const,
}

const totalsDiscountValue = {
  color: '#16a34a',
  fontSize: '14px',
  textAlign: 'right' as const,
}

const totalsDivider = {
  height: '1px',
  backgroundColor: '#e5e7eb',
  marginBottom: '12px',
}

const totalsTotalLabel = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: '700' as const,
  textAlign: 'left' as const,
}

const totalsTotalValue = {
  color: '#7c3aed',
  fontSize: '18px',
  fontWeight: '700' as const,
  textAlign: 'right' as const,
}

const noteSection = {
  padding: '24px',
  backgroundColor: '#fef3c7',
}

const noteCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #fcd34d',
  borderRadius: '12px',
  padding: '16px',
}

const noteText = {
  color: '#78350f',
  fontSize: '15px',
  fontStyle: 'italic',
  margin: '0',
  lineHeight: '1.6',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '0',
}

const actionSection = {
  padding: '24px',
  textAlign: 'center' as const,
}

const actionList = {
  textAlign: 'left' as const,
  marginBottom: '24px',
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '12px',
}

const actionItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '12px',
  gap: '12px',
}

const checkboxIcon = {
  color: '#7c3aed',
  fontSize: '20px',
  fontWeight: 'bold',
  lineHeight: '24px',
  flexShrink: 0,
}

const actionText = {
  color: '#4b5563',
  fontSize: '15px',
  margin: '0',
  lineHeight: '24px',
}

const urlBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '24px',
}

const urlLabel = {
  color: '#6b7280',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 8px 0',
}

const urlText = {
  color: '#1f2937',
  fontSize: '13px',
  margin: '0',
  wordBreak: 'break-all' as const,
  fontFamily: 'monospace',
}

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 8px 0',
}

const link = {
  color: '#7c3aed',
  textDecoration: 'none',
  fontWeight: '500',
}

const copyright = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
}
