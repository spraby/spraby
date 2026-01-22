# Email-уведомления - Решение проблем

## Проблема 1: Письма не отправляются

### Симптом
В логах сервера:
```
[EMAIL DISABLED] Would send order confirmation to: customer@example.com
[EMAIL DISABLED] Would send new order notification to: seller@example.com
```

### Причина
Email-отправка отключена в конфигурации.

### Решение
Откройте файл `.env` и измените:
```env
RESEND_ENABLED=true
```

Перезапустите dev сервер:
```bash
npm run dev
```

---

## Проблема 2: Продавец не получает письма (email undefined)

### Симптом
В логах сервера:
```
[EMAIL DISABLED] Would send new order notification to: undefined
```
или
```
[ORDER] Brand has no associated user email, skipping seller notification: BrandName
```

### Причина
У бренда (продавца) не указан пользователь с email в базе данных.

### Как это работает
Email продавца берется из связанного пользователя:
```
Brand → User → email
```

### Решение

#### Вариант 1: Через админ-панель (если есть)
1. Войдите в админ-панель
2. Найдите бренд
3. Привяжите пользователя к бренду или создайте нового пользователя

#### Вариант 2: Через базу данных напрямую

**1. Проверьте текущее состояние:**
```sql
SELECT
  b.id as brand_id,
  b.name as brand_name,
  b.user_id,
  u.email as user_email
FROM brands b
LEFT JOIN users u ON b.user_id = u.id;
```

**2. Найдите ID пользователя, которого хотите привязать:**
```sql
SELECT id, email, name FROM users;
```

**3. Привяжите пользователя к бренду:**
```sql
UPDATE brands
SET user_id = <USER_ID>
WHERE id = <BRAND_ID>;
```

**Пример:**
```sql
-- Привязать пользователя с ID 1 к бренду с ID 5
UPDATE brands
SET user_id = 1
WHERE id = 5;
```

#### Вариант 3: Создать нового пользователя для бренда

```sql
-- 1. Создать пользователя
INSERT INTO users (email, name, password, created_at, updated_at)
VALUES ('seller@example.com', 'Seller Name', '$2b$10$hashedpassword', NOW(), NOW())
RETURNING id;

-- 2. Привязать к бренду (используйте ID из предыдущего запроса)
UPDATE brands
SET user_id = <NEW_USER_ID>
WHERE id = <BRAND_ID>;
```

---

## Проблема 3: Письма отправляются, но не приходят

### Симптом
В логах:
```
[EMAIL SENT] Order confirmation to: customer@example.com - ID: abc123
[EMAIL SENT] New order notification to: seller@example.com - ID: def456
```
Но письма не приходят.

### Возможные причины

#### 1. Неверный API ключ Resend

**Проверка:**
```bash
# В .env файле
RESEND_API_KEY=re_ваш_ключ_здесь
```

**Решение:**
- Проверьте ключ на [resend.com/api-keys](https://resend.com/api-keys)
- Убедитесь, что ключ активен и не истек
- Скопируйте новый ключ если нужно

#### 2. Домен не верифицирован

**Проверка:**
В `.env`:
```env
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Решение для разработки:**
Используйте тестовый домен Resend:
```env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Решение для production:**
1. Добавьте домен в [resend.com/domains](https://resend.com/domains)
2. Настройте DNS записи (SPF, DKIM)
3. Дождитесь верификации
4. Используйте email на вашем домене

#### 3. Письма в спаме

**Проверка:**
Проверьте папку "Спам" в почтовом клиенте.

**Решение:**
- Для разработки: используйте `onboarding@resend.dev`
- Для production: настройте SPF и DKIM записи
- Добавьте отправителя в белый список

#### 4. Rate limit Resend

**Проверка:**
В логах ошибка:
```
[RESEND ERROR] Order confirmation: { message: 'Rate limit exceeded' }
```

**Решение:**
- Бесплатный план: 100 emails/день, 3000/месяц
- Подождите или обновите план на Resend

---

## Проблема 4: Ошибка "Invalid API key"

### Симптом
```
[RESEND ERROR] Order confirmation: { message: 'Invalid API key' }
```

### Решение
1. Проверьте правильность API ключа в `.env`
2. Убедитесь, что ключ начинается с `re_`
3. Создайте новый ключ на [resend.com](https://resend.com)
4. Перезапустите сервер после изменения `.env`

---

## Проверка конфигурации

### Чек-лист для отправки email

- [ ] `RESEND_ENABLED=true` в `.env`
- [ ] `RESEND_API_KEY` указан и валиден
- [ ] `RESEND_FROM_EMAIL` указан (для dev: `onboarding@resend.dev`)
- [ ] У бренда есть связанный пользователь с email
- [ ] Dev сервер перезапущен после изменения `.env`

### Тестовая отправка

1. Включите email в `.env`:
   ```env
   RESEND_ENABLED=true
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

2. Перезапустите сервер:
   ```bash
   npm run dev
   ```

3. Создайте тестовый заказ:
   - Добавьте товар в корзину
   - Укажите свой реальный email
   - Оформите заказ

4. Проверьте логи в терминале:
   ```
   [EMAIL SENT] Order confirmation to: your@email.com - ID: abc123
   [ORDER] Email notifications sent for order: #240104-123456 { customer: true, seller: true }
   ```

5. Проверьте почту (включая спам)

---

## Отладка

### Включить детальное логирование

В файле `lib/email/send.ts` все логи уже включены:
- `[EMAIL SENT]` - успешная отправка
- `[EMAIL DISABLED]` - отправка отключена
- `[RESEND ERROR]` - ошибка от Resend API
- `[EMAIL ERROR]` - общая ошибка

### Проверка в Resend Dashboard

1. Откройте [resend.com/emails](https://resend.com/emails)
2. Посмотрите список отправленных писем
3. Проверьте статус доставки
4. Посмотрите детали ошибок если есть

---

## Получение помощи

Если проблема не решена:

1. Проверьте логи сервера
2. Проверьте конфигурацию `.env`
3. Проверьте связь Brand → User → email в базе данных
4. Проверьте Resend Dashboard
5. Напишите на support@spraby.com с описанием проблемы и логами
