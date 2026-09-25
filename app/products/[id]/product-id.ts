const MAX_POSTGRES_BIGINT = BigInt("9223372036854775807");

/** id товара из адреса: только положительное целое в пределах bigint Postgres. */
export function parseProductId(value: unknown) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;

  const id = BigInt(value);
  return id > BigInt(0) && id <= MAX_POSTGRES_BIGINT ? id : null;
}
