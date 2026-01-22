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
} from '@react-email/components'

interface PasswordResetProps {
  brandName: string
  resetCode: string
  expiresInMinutes: number
}

export default function PasswordReset({
  brandName,
  resetCode,
  expiresInMinutes = 30,
}: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Код для сброса пароля: {resetCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>spraby</Heading>
            <Text style={tagline}>маркетплейс авторских товаров</Text>
          </Section>

          {/* Main Content */}
          <Section style={section}>
            <Heading style={h1}>Сброс пароля</Heading>
            <Text style={text}>
              Здравствуйте, <strong>{brandName}</strong>!
            </Text>
            <Text style={text}>
              Мы получили запрос на сброс пароля для вашего аккаунта продавца на spraby.
            </Text>
          </Section>

          {/* Code Section */}
          <Section style={codeSection}>
            <Text style={codeLabel}>Ваш код подтверждения:</Text>
            <div style={codeBox}>
              <Text style={codeText}>{resetCode}</Text>
            </div>
            <Text style={codeHint}>
              Введите этот код на странице сброса пароля
            </Text>
          </Section>

          <Section style={section}>
            <Text style={warningText}>
              ⏱ Код действителен в течение {expiresInMinutes} минут.
            </Text>
            <Text style={text}>
              Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
              Ваш пароль останется без изменений.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Security Notice */}
          <Section style={securitySection}>
            <Text style={securityTitle}>🔒 Советы по безопасности</Text>
            <Text style={securityText}>
              • Никогда не сообщайте этот код другим людям
            </Text>
            <Text style={securityText}>
              • Сотрудники spraby никогда не попросят ваш пароль
            </Text>
            <Text style={securityText}>
              • Используйте надёжный пароль (минимум 6 символов)
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Это автоматическое уведомление. Пожалуйста, не отвечайте на это письмо.
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} spraby. Все права защищены.
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

const section = {
  padding: '24px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
}

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 12px 0',
}

const codeSection = {
  padding: '24px',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
}

const codeLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 16px 0',
  fontWeight: '500',
}

const codeBox = {
  backgroundColor: '#ffffff',
  border: '2px dashed #7c3aed',
  borderRadius: '12px',
  padding: '24px',
  margin: '0 auto 16px auto',
  maxWidth: '280px',
}

const codeText = {
  color: '#7c3aed',
  fontSize: '36px',
  fontWeight: 'bold' as const,
  letterSpacing: '8px',
  margin: '0',
  fontFamily: 'monospace',
}

const codeHint = {
  color: '#9ca3af',
  fontSize: '13px',
  margin: '0',
}

const warningText = {
  color: '#b45309',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 16px 0',
  padding: '12px 16px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '0',
}

const securitySection = {
  padding: '24px',
  backgroundColor: '#eff6ff',
}

const securityTitle = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px 0',
}

const securityText = {
  color: '#3b82f6',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 4px 0',
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

const copyright = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
}
