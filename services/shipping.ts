// Расчёт стоимости доставки из merchant-полей способа доставки.
// Общий модуль без 'use client'/'use server': импортируется и клиентским
// ShippingMethodPicker (мгновенный предпросмотр «Итого»), и серверным
// services/Orders.ts (авторитетный расчёт при создании заказа).

export type StoreShippingField = {
  key: string;
  name: string;
  type: string;
  value: string | string[];
};

export const SHIPPING_PRICE_FIELD_KEY = 'shipping_price';
export const FREE_SHIPPING_THRESHOLD_FIELD_KEY = 'free_shipping_threshold';
export const SHIPPING_COMMENTS_FIELD_KEY = 'comments';
export const PICKUP_MERCHANT_FIELD_KEY = 'pickup_points';

export const hasMerchantValue = (field: StoreShippingField): boolean => {
  return Array.isArray(field.value) ? field.value.length > 0 : `${field.value ?? ''}`.trim().length > 0;
};

/** Значение merchant-поля как строка; null для списков и пустых значений. */
export const merchantFieldValue = (
  fields: StoreShippingField[],
  fieldKey: string,
): string | null => {
  const value = fields.find(field => field.key === fieldKey)?.value;
  if (Array.isArray(value)) return null;

  const normalized = `${value ?? ''}`.trim();
  return normalized.length ? normalized : null;
};

/**
 * shipping_price / free_shipping_threshold — свободный текст продавца
 * (старые данные; новые значения валидируются числом при сохранении).
 * Берём ведущую числовую часть («10 руб.» → 10), «1 500» и «1.500» читаем
 * как тысячи, «5,50» — как десятичную. Всё нераспознанное → null
 * («стоимость согласуется»), а не тихое неверное число.
 */
export const parseShippingAmount = (value: string | null): number | null => {
  if (!value) return null;

  const numericPart = value.trim().match(/^\d[\d\s.,]*/)?.[0]?.replace(/\s/g, '').replace(/[.,]+$/, '');
  if (!numericPart) return null;

  const normalized = /^\d{1,3}(?:[.,]\d{3})+$/.test(numericPart)
    ? numericPart.replace(/[.,]/g, '')
    : numericPart;
  if ((normalized.match(/[.,]/g) ?? []).length > 1) return null;

  const amount = Number(normalized.replace(',', '.'));
  return Number.isFinite(amount) ? amount : null;
};

/**
 * Метод считается самовывозом только при заполненном списке пунктов:
 * само наличие ключа в конструкторе ещё не значит, что продавец его настроил.
 */
export const isPickupConfigured = (merchantFields: StoreShippingField[]): boolean => {
  const pickupPoints = merchantFields.find(field => field.key === PICKUP_MERCHANT_FIELD_KEY);
  return Boolean(pickupPoints && hasMerchantValue(pickupPoints));
};

/**
 * Стоимость доставки для суммы товаров бренда.
 * null — стоимость неизвестна (согласуется с продавцом).
 */
export const computeShippingCost = (
  merchantFields: StoreShippingField[],
  brandTotal: number,
): number | null => {
  const price = parseShippingAmount(merchantFieldValue(merchantFields, SHIPPING_PRICE_FIELD_KEY));
  if (price === null) return isPickupConfigured(merchantFields) ? 0 : null;

  const freeThreshold = parseShippingAmount(merchantFieldValue(merchantFields, FREE_SHIPPING_THRESHOLD_FIELD_KEY));
  if (freeThreshold !== null && freeThreshold > 0 && brandTotal >= freeThreshold) {
    return 0;
  }

  return price;
};

/** merchant_settings из БД (jsonb) → валидные поля-снапшоты. */
export const normalizeMerchantFields = (raw: unknown): StoreShippingField[] => {
  if (!Array.isArray(raw)) return [];

  return raw.filter((field): field is StoreShippingField =>
    Boolean(field && typeof field === 'object' && typeof (field as any).key === 'string'));
};
