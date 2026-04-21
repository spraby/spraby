export const serializeObject = (obj: any) => {
  const json = JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value
  );
  return JSON.parse(json);
};

export const toMoney = (value: number, template: string = '{{amount}} BYN') => {
  const formattedValue = (Math.round(value * 100) / 100).toFixed(2);
  return template.replaceAll('{{amount}}', formattedValue);
}

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
