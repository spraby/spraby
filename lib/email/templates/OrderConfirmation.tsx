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

interface OrderConfirmationProps {
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

export default function OrderConfirmation({
  customerName,
  orderNumber,
  productTitle,
  variantTitle,
  price,
  finalPrice,
  brandName,
  customerEmail,
  customerPhone,
  note,
  productImage,
}: OrderConfirmationProps) {
  const hasDiscount = price !== finalPrice

  // Парсим опции товара из variantTitle
  const variantOptions = variantTitle ? variantTitle.split(', ').map(option => {
    const [label, value] = option.split(': ')
    return { label, value }
  }) : []

  return (
    <Html>
      <Head />
      <Preview>Ваш заказ {orderNumber} успешно оформлен</Preview>
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
            <Text style={orderNumber}>Номер заказа: <strong>{orderNumber}</strong></Text>
          </Section>

          {/* Customer Info */}
          <Section style={section}>
            <Text style={greeting}>Здравствуйте, {customerName}!</Text>
            <Text style={text}>
              Спасибо за ваш заказ. Мы получили его и уже передали информацию продавцу <strong>{brandName}</strong>.
            </Text>
          </Section>

          {/* Product Details */}
          <Section style={productSection}>
            <Heading style={sectionTitle}>Информация о заказе</Heading>

            <div style={productCard}>
              <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                <tr>
                  {productImage && (
                    <td style={{width: '100px', paddingRight: '16px', verticalAlign: 'top'}}>
                      <Img
                        src={productImage}
                        alt={productTitle}
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
                    <Text style={productTitleStyle}>{productTitle}</Text>

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
                        <Text style={oldPrice}>{price} BYN</Text>
                      )}
                      <Text style={finalPriceText}>{finalPrice} BYN</Text>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
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
              Продавец свяжется с вами в ближайшее время для уточнения деталей доставки и оплаты.
            </Text>
            <div style={stepsList}>
              <table cellPadding="0" cellSpacing="0" border={0} width="100%" style={{marginBottom: '16px'}}>
                <tr>
                  <td style={{width: '28px', verticalAlign: 'top', paddingRight: '12px'}}>
                    <div style={{
                      ...stepNumber,
                      lineHeight: '28px',
                      textAlign: 'center',
                    }}>1</div>
                  </td>
                  <td style={{verticalAlign: 'top', paddingTop: '4px'}}>
                    <Text style={stepText}>Продавец подтвердит наличие товара</Text>
                  </td>
                </tr>
              </table>

              <table cellPadding="0" cellSpacing="0" border={0} width="100%" style={{marginBottom: '16px'}}>
                <tr>
                  <td style={{width: '28px', verticalAlign: 'top', paddingRight: '12px'}}>
                    <div style={{
                      ...stepNumber,
                      lineHeight: '28px',
                      textAlign: 'center',
                    }}>2</div>
                  </td>
                  <td style={{verticalAlign: 'top', paddingTop: '4px'}}>
                    <Text style={stepText}>Согласуете способ доставки</Text>
                  </td>
                </tr>
              </table>

              <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                <tr>
                  <td style={{width: '28px', verticalAlign: 'top', paddingRight: '12px'}}>
                    <div style={{
                      ...stepNumber,
                      lineHeight: '28px',
                      textAlign: 'center',
                    }}>3</div>
                  </td>
                  <td style={{verticalAlign: 'top', paddingTop: '4px'}}>
                    <Text style={stepText}>Получите ваш заказ!</Text>
                  </td>
                </tr>
              </table>
            </div>
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

const logoLink = {
  textDecoration: 'none',
  display: 'inline-block',
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

const orderNumber = {
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
  backgroundColor: '#f9fafb',
}

const productCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '20px',
}

const productTitleStyle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
}

const variantText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
}

const priceContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginTop: '12px',
}

const oldPrice = {
  color: '#9ca3af',
  fontSize: '16px',
  textDecoration: 'line-through',
  margin: '0',
}

const finalPriceText = {
  color: '#7c3aed',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
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

const stepsList = {
  marginTop: '20px',
}

const stepNumber = {
  backgroundColor: '#ede9fe',
  color: '#7c3aed',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  fontSize: '14px',
  fontWeight: 'bold' as const,
}

const stepText = {
  color: '#4b5563',
  fontSize: '15px',
  margin: '4px 0 0 0',
  lineHeight: '1.5',
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
