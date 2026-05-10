export const serializeObject = (obj: any) => {
  const json = JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value
  );
  return JSON.parse(json);
};

export type MoneyInput = number | string | null | undefined;

const parseMoneyAmount = (value: MoneyInput): number | undefined => {
  if (value == null || value === '') return undefined;

  const normalizedValue = typeof value === 'string'
    ? value.replace(/\s/g, '').replace(',', '.')
    : value;
  const numericValue = Number(normalizedValue);

  return Number.isFinite(numericValue) ? numericValue : undefined;
};

export const toMoney = (value: MoneyInput, fallback = ''): string => {
  const numericValue = parseMoneyAmount(value);
  return numericValue === undefined ? fallback : numericValue.toFixed(2);
};

export const calculateDiscountPercent = (price: number, finalPrice: number): number => (
  price > 0 && finalPrice < price
    ? Math.max(1, Math.round((1 - finalPrice / price) * 100))
    : 0
);

export const toIdString = (value: unknown): string => {
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number') return Number.isFinite(value) ? value.toString() : '';
  if (typeof value === 'string') return value.trim();
  return '';
};

export const normalizeImageSrc = (raw?: string | null): string | null => {
  if (!raw) return null;
  const value = raw.trim();
  if (!value.length) return null;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return value;
  const stripped = value.replace(/^\.?\//, '');
  return stripped.length ? `/${stripped}` : null;
};
