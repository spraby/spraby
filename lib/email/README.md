# Email система

Структура email-уведомлений для заказов.

## Файлы

### `resend.ts`
Конфигурация Resend клиента и переменных окружения.

**Экспортирует:**
- `resend` - экземпляр Resend клиента
- `FROM_EMAIL` - email отправителя
- `IS_EMAIL_ENABLED` - флаг включения/выключения отправки
- `SUPPORT_EMAIL` - email поддержки

### `send.ts`
Функции для отправки писем.

**Функции:**
- `sendOrderConfirmationEmail()` - отправка подтверждения покупателю
- `sendNewOrderNotificationEmail()` - отправка уведомления продавцу
- `sendOrderEmails()` - отправка обоих писем параллельно

**Особенности:**
- Проверка `IS_EMAIL_ENABLED` перед отправкой
- Полное логирование всех операций
- Обработка ошибок без выброса исключений
- Возврат объекта с `{ success, data/error }`

### `templates/OrderConfirmation.tsx`
React Email шаблон письма покупателю.

**Содержит:**
- Информацию о заказе
- Детали товара с ценой
- Контактные данные
- Инструкцию "Что дальше?" (3 шага)
- Footer с контактами поддержки

**Стиль:** Фиолетовый header (#7c3aed), чистый дизайн, mobile-friendly

### `templates/NewOrderNotification.tsx`
React Email шаблон уведомления продавцу.

**Содержит:**
- Контактную информацию покупателя (кликабельные email/телефон)
- Детали заказа
- Комментарий покупателя (если есть)
- Чек-лист действий
- Кнопку для перехода в панель управления

**Стиль:** Фиолетовый header, желтый alert, синяя секция с покупателем, профессиональный вид

## Использование

```typescript
import {sendOrderConfirmationEmail} from '@/lib/email/send'

await sendOrderConfirmationEmail({
  to: 'customer@example.com',
  customerName: 'Иван Иванов',
  orderNumber: '#240104-123456',
  productTitle: 'Футболка',
  variantTitle: 'Размер: L, Цвет: Черный',
  price: '50.00',
  finalPrice: '40.00',
  brandName: 'MyBrand',
  customerEmail: 'customer@example.com',
  customerPhone: '+375291234567',
  note: 'Доставка после 18:00'
})
```

## Интеграция

Email-уведомления автоматически отправляются через `services/Orders.createWithNotifications()`.

При создании заказа:
1. Заказ создается в БД
2. Запускается асинхронная отправка писем (не блокирует ответ)
3. Письма отправляются параллельно покупателю и продавцу
4. Логируются результаты отправки

## Конфигурация

См. [EMAIL_QUICKSTART.md](../../EMAIL_QUICKSTART.md) для быстрого старта и [EMAIL_SETUP.md](../../EMAIL_SETUP.md) для полной документации.

## Разработка шаблонов

Для предпросмотра шаблонов:

```bash
npx react-email dev
```

Откроется браузер с live preview всех шаблонов.
