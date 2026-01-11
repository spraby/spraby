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
import { EmailOrderSummary } from '../types'

interface OrderSummaryProps {
  customerName: string
  customerEmail: string
  customerPhone: string
  note?: string
  orders: EmailOrderSummary[]
}

export default function OrderSummary({
  customerName,
  customerEmail,
  customerPhone,
  note,
  orders,
}: OrderSummaryProps) {
  const totalOrders = orders.length

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
      <Preview>Ваш заказ на Spraby получен</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>spraby</Heading>
            <Text style={tagline}>маркетплейс авторских товаров</Text>
          </Section>

          {/* Success Message */}
          <Section style={successSection}>
            <Text style={successIcon}>✓</Text>
            <Heading style={h1}>Заказ оформлен!</Heading>
            <Text style={orderNumberText}>
              Создано заказов: <strong>{totalOrders}</strong>
            </Text>
          </Section>

          {/* Customer Info */}
          <Section style={section}>
            <Text style={greeting}>Здравствуйте, {customerName}!</Text>
            <Text style={text}>
              Мы получили ваш заказ и передали информацию продавцам. Ниже — ваши заказы и ссылки на отслеживание.
            </Text>
          </Section>

          {/* Orders List */}
          <Section style={productSection}>
            <Heading style={sectionTitle}>Ваши заказы</Heading>

            {orders.map((order, orderIndex) => (
              <div style={orderCard} key={`${order.orderNumber}-${orderIndex}`}>
                <div style={orderMeta}>
                  <Row style={orderRow}>
                    <Column style={orderLabel}>Продавец:</Column>
                    <Column style={orderValue}>{order.brandName}</Column>
                  </Row>
                  <Row style={orderRow}>
                    <Column style={orderLabel}>Номер заказа:</Column>
                    <Column style={orderNumberValue}>{order.orderNumber}</Column>
                  </Row>
                </div>

                <a href={order.trackingUrl} style={trackingButton}>
                  Отслеживать этот заказ
                </a>

                {order.items.map((item, index) => {
                  const priceValue = Number(item.price)
                  const finalPriceValue = Number(item.finalPrice)
                  const hasDiscount = priceValue > finalPriceValue
                  const discountPercent = hasDiscount && priceValue > 0
                    ? Math.round((1 - (finalPriceValue / priceValue)) * 100)
                    : 0
                  const variantOptions = getVariantOptions(item.variantTitle)
                  const cardStyle = index < order.items.length - 1 ? productCardWithSpacing : productCard

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

                            <div style={priceContainer}>
                              {hasDiscount && (
                                <Text style={oldPrice}>{item.price} BYN</Text>
                              )}
                              <span style={finalPriceGroup}>
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
                      <td style={totalsLabel}>Товары ({order.itemsCount})</td>
                      <td style={totalsValue}>{order.totalPrice} BYN</td>
                    </tr>
                    {Number(order.totalDiscount) > 0 && (
                      <tr>
                        <td style={totalsDiscountLabel}>Скидка</td>
                        <td style={totalsDiscountValue}>-{order.totalDiscount} BYN</td>
                      </tr>
                    )}
                  </table>
                  <div style={totalsDivider} />
                  <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                    <tr>
                      <td style={totalsTotalLabel}>Итого</td>
                      <td style={totalsTotalValue}>{order.totalFinalPrice} BYN</td>
                    </tr>
                  </table>
                </div>
              </div>
            ))}
          </Section>

          {/* Contact Details */}
          <Section style={section}>
            <Heading style={sectionTitle}>Ваши контактные данные</Heading>
            <Row style={infoRow}>
              <Column style={infoLabel}>Email:</Column>
              <Column style={infoValue}>{customerEmail}</Column>
            </Row>
            <Row style={infoRow}>
              <Column style={infoLabel}>Телефон:</Column>
              <Column style={infoValue}>{customerPhone}</Column>
            </Row>
            {note && (
              <Row style={infoRow}>
                <Column style={infoLabel}>Комментарий:</Column>
                <Column style={infoValue}>{note}</Column>
              </Row>
            )}
          </Section>

          <Hr style={hr} />

          {/* Next Steps */}
          <Section style={section}>
            <Heading style={sectionTitle}>Что дальше?</Heading>
            <Text style={text}>
              Продавцы свяжутся с вами в ближайшее время для уточнения деталей доставки и оплаты.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Если у вас возникли вопросы, свяжитесь с нами по адресу{' '}
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

const successSection = {
  textAlign: 'center' as const,
  padding: '40px 24px 32px',
}

const successIcon = {
  fontSize: '48px',
  color: '#10b981',
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

const orderNumberText = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
}

const section = {
  padding: '0 24px 24px',
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

const productSection = {
  padding: '24px',
  backgroundColor: '#ffffff',
}

const orderCard = {
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '20px',
  backgroundColor: '#ffffff',
}

const orderMeta = {
  marginBottom: '12px',
}

const orderRow = {
  marginBottom: '8px',
}

const orderLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  width: '120px',
}

const orderValue = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '600',
  textAlign: 'right' as const,
}

const orderNumberValue = {
  color: '#7c3aed',
  fontSize: '14px',
  fontWeight: '700',
  textAlign: 'right' as const,
}

const trackingButton = {
  display: 'block',
  textAlign: 'center' as const,
  padding: '12px 16px',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  color: '#7c3aed',
  border: '1px solid #e5e7eb',
  fontSize: '14px',
  fontWeight: '700' as const,
  textDecoration: 'none',
  marginBottom: '16px',
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

const priceContainer = {
  marginTop: '12px',
  display: 'flex',
  alignItems: 'center',
}

const finalPriceGroup = {
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

const infoRow = {
  marginBottom: '12px',
}

const infoLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  width: '120px',
  paddingRight: '12px',
}

const infoValue = {
  color: '#1f2937',
  fontSize: '14px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
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
