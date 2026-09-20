/**
 * Контакты бренда: нормализация ссылок и подписей.
 *
 * Значения приходят как их ввёл продавец — «@user», «+375 (29) 000-00-00»,
 * готовый адрес, — поэтому ссылку собираем по типу контакта.
 */

export const SOCIAL_CONTACT_TYPES = ['whatsapp', 'telegram', 'instagram', 'facebook'];

export const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook'
};

export const normalizeSocialUrl = (type: string, raw: string): string => {
  const value = raw.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (type === 'instagram') {
    const username = value.replace(/^@/, '');
    return `https://instagram.com/${username}`;
  }
  if (type === 'telegram') {
    const username = value.replace(/^@/, '');
    return `https://t.me/${username}`;
  }
  if (type === 'whatsapp') {
    const digitsOnly = value.replace(/[^\d]/g, '');
    return digitsOnly.length ? `https://wa.me/${digitsOnly}` : value;
  }
  if (value.includes('.')) {
    const sanitized = value.replace(/^https?:\/\//i, '');
    return `https://${sanitized}`;
  }
  return value;
};

export const getSocialDisplayValue = (type: string, raw: string): string => {
  const value = raw.trim();
  if (!value) return '';
  if (type === 'instagram' || type === 'telegram') {
    const username = value.replace(/^@/, '');
    return `@${username}`;
  }
  return value;
};

export const normalizePhoneHref = (value: string): string => {
  const clean = value.replace(/[^\d+]/g, '');
  return clean.length ? `tel:${clean}` : `tel:${value}`;
};

export const normalizeEmailHref = (value: string): string => `mailto:${value.trim()}`;

export type ContactSocial = {
  type: string
  label: string
  value: string
  url: string
  display: string
};
