# Настройка Email-уведомлений

Система email-уведомлений построена на базе [Resend](https://resend.com) и [React Email](https://react.email).

## Установка зависимостей

```bash
npm install resend react-email @react-email/components
```

## Настройка Resend

1. Зарегистрируйтесь на [resend.com](https://resend.com)
2. Получите API ключ в панели управления
3. Настройте домен для отправки писем (или используйте тестовый домен `onboarding.resend.dev`)

## Переменные окружения

Добавьте в файл `.env`:

```env
# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_ENABLED=true

# Site URL для ссылок в письмах
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Переменные:

- `RESEND_API_KEY` - API ключ от Resend (обязательно для production)
- `RESEND_FROM_EMAIL` - Email отправителя (должен быть верифицирован в Resend)
- `RESEND_ENABLED` - Включить/выключить отправку писем (`true`/`false`)
- `NEXT_PUBLIC_SITE_URL` - URL сайта для ссылок в письмах

## Структура файлов

```
store/
├── lib/
│   └── email/
│       ├── resend.ts                      # Конфигурация Resend
│       ├── send.ts                        # Функции отправки
│       └── templates/
│           ├── OrderConfirmation.tsx      # Письмо покупателю
│           └── NewOrderNotification.tsx   # Письмо продавцу
├── services/
│   └── Orders.ts                          # Интеграция с заказами
```

## Типы отправляемых писем

### 1. Подтверждение заказа (покупателю)

Отправляется автоматически после создания заказа на email покупателя.

**Содержит:**
- Номер заказа
- Информацию о товаре
- Цену (с учетом скидки)
- Контактные данные покупателя
- Пошаговую инструкцию "Что дальше?"

### 2. Уведомление о новом заказе (продавцу)

Отправляется автоматически после создания заказа на email бренда/продавца.

**Содержит:**
- Информацию о покупателе (имя, email, телефон)
- Детали заказа
- Комментарий покупателя (если есть)
- Чек-лист необходимых действий
- Кнопку для перехода в панель управления

## Использование

### Автоматическая отправка при создании заказа

Email-уведомления отправляются автоматически при использовании функции `createWithNotifications`:

```typescript
import {createWithNotifications} from "@/services/Orders";

const order = await createWithNotifications({
  data: {
    name: '#240104-123456789',
    Customer: {
      connectOrCreate: {
        where: { email: 'customer@example.com' },
        create: {
          email: 'customer@example.com',
          name: 'Иван Иванов',
          phone: '+375291234567'
        }
      }
    },
    Brand: {
      connect: { id: brandId }
    },
    // ... остальные поля
  }
});
```

### Ручная отправка писем

Если нужно отправить письма вручную:

```typescript
import {sendOrderConfirmationEmail, sendNewOrderNotificationEmail} from "@/lib/email/send";

// Письмо покупателю
await sendOrderConfirmationEmail({
  to: 'customer@example.com',
  customerName: 'Иван Иванов',
  orderNumber: '#240104-123456789',
  productTitle: 'Футболка',
  variantTitle: 'Размер: L, Цвет: Черный',
  price: '50.00',
  finalPrice: '40.00',
  brandName: 'MyBrand',
  customerEmail: 'customer@example.com',
  customerPhone: '+375291234567',
  note: 'Доставка к 18:00'
});

// Письмо продавцу
await sendNewOrderNotificationEmail({
  to: 'seller@example.com',
  brandName: 'MyBrand',
  orderNumber: '#240104-123456789',
  customerName: 'Иван Иванов',
  customerEmail: 'customer@example.com',
  customerPhone: '+375291234567',
  productTitle: 'Футболка',
  variantTitle: 'Размер: L, Цвет: Черный',
  price: '50.00',
  finalPrice: '40.00',
  note: 'Доставка к 18:00',
  orderUrl: 'https://spraby.com/admin/orders/123'
});
```

## Разработка и тестирование

### Режим разработки

В разработке по умолчанию `RESEND_ENABLED=false`. При этом письма не отправляются, но в консоль выводятся логи:

```
[EMAIL DISABLED] Would send order confirmation to: customer@example.com
[EMAIL DISABLED] Would send new order notification to: seller@example.com
```

### Включение отправки в dev

Установите `RESEND_ENABLED=true` и используйте тестовый домен Resend:

```env
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_ENABLED=true
```

### Предпросмотр шаблонов

Используйте React Email CLI для предпросмотра:

```bash
npx react-email dev
```

Откроется браузер с превью всех шаблонов писем.

## Логирование

Все операции с email логируются:

```
[EMAIL SENT] Order confirmation to: customer@example.com - ID: abc123
[EMAIL SENT] New order notification to: seller@example.com - ID: def456
[ORDER] Email notifications sent for order: #240104-123456789 { customer: true, seller: true }
```

При ошибках:

```
[RESEND ERROR] Order confirmation: { message: 'Invalid API key' }
[ORDER] Failed to send email notifications for order: 123 Error: ...
```

## Production

Для production:

1. Верифицируйте домен в Resend
2. Настройте DNS записи (SPF, DKIM)
3. Установите `RESEND_ENABLED=true`
4. Укажите свой домен в `RESEND_FROM_EMAIL`
5. Добавьте реальный `NEXT_PUBLIC_SITE_URL`

## Кастомизация шаблонов

Шаблоны находятся в `lib/email/templates/`. Используйте компоненты из `@react-email/components`:

- `<Html>`, `<Head>`, `<Body>` - структура
- `<Container>` - контейнер с ограниченной шириной
- `<Section>` - секции контента
- `<Text>`, `<Heading>` - текст
- `<Button>`, `<Link>` - кнопки и ссылки
- `<Row>`, `<Column>` - сетка
- `<Hr>` - разделитель

Стили задаются inline-объектами (email-safe).

## Troubleshooting

### Письма не отправляются

1. Проверьте `RESEND_ENABLED=true`
2. Проверьте правильность `RESEND_API_KEY`
3. Проверьте логи в консоли
4. Проверьте, что домен верифицирован в Resend

### Письма попадают в спам

1. Настройте SPF и DKIM записи
2. Используйте верифицированный домен
3. Избегайте "спамовых" слов в теме и тексте

### Ошибка "Invalid API key"

API ключ неверный или отозван. Проверьте в панели Resend.

## Поддержка

По вопросам обращайтесь: support@spraby.com
