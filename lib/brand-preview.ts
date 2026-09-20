import {createHmac, timingSafeEqual} from "crypto";

/**
 * Превью неопубликованной страницы бренда.
 *
 * Витрина не знает ролей админки, поэтому доступ даёт подпись общим секретом
 * (BRAND_PREVIEW_SECRET) с ограниченным сроком жизни, а не авторизация.
 */
export function isValidBrandPreviewToken(handle: string, token?: string | null): boolean {
  const secret = process.env.BRAND_PREVIEW_SECRET;

  if (!secret || !token) return false;

  const separator = token.indexOf('.');
  if (separator < 1) return false;

  const expiresAt = Number(token.slice(0, separator));
  const signature = token.slice(separator + 1);

  if (!Number.isFinite(expiresAt) || expiresAt * 1000 < Date.now()) return false;

  const expected = createHmac('sha256', secret)
    .update(`${handle}:${expiresAt}`)
    .digest('hex');

  // Сравнение постоянного времени: подпись подбирать по таймингу нельзя.
  const given = Buffer.from(signature);
  const valid = Buffer.from(expected);

  return given.length === valid.length && timingSafeEqual(given, valid);
}
