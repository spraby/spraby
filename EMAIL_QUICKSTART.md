# Email-уведомления - Быстрый старт

## 1. Получите API ключ

1. Зарегистрируйтесь на [resend.com](https://resend.com)
2. Создайте API ключ в разделе "API Keys"
3. Скопируйте ключ (начинается с `re_`)

## 2. Настройте переменные окружения

Откройте файл `.env` и установите:

```env
RESEND_API_KEY=re_ваш_ключ_здесь
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_ENABLED=true
NEXT_PUBLIC_SITE_URL=http://localhost:3010
```

> **Примечание**: `onboarding@resend.dev` - тестовый домен Resend для разработки. В production замените на свой верифицированный домен.

## 3. Перезапустите dev сервер

```bash
npm run dev
```

## 4. Проверьте работу

Создайте тестовый заказ через форму оформления заказа на сайте. После создания:

1. Проверьте консоль сервера - должны быть логи отправки:
   ```
   [EMAIL SENT] Order confirmation to: customer@example.com - ID: abc123
   [EMAIL SENT] New order notification to: seller@example.com - ID: def456
   ```

2. Проверьте почту покупателя и продавца

## Что отправляется?

- **Покупателю**: Письмо с подтверждением заказа, деталями товара и следующими шагами
- **Продавцу**: Уведомление с контактами покупателя, деталями заказа и чек-листом действий

## Отключить email

Установите в `.env`:

```env
RESEND_ENABLED=false
```

При отключенных письмах в консоли будут логи:

```
[EMAIL DISABLED] Would send order confirmation to: customer@example.com
```

## Production

Для production:

1. Добавьте и верифицируйте свой домен в Resend
2. Настройте DNS (SPF, DKIM) согласно инструкции Resend
3. Измените `.env`:
   ```env
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

## Проблемы?

См. полную документацию в [EMAIL_SETUP.md](./EMAIL_SETUP.md)
