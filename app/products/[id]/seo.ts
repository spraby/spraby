import {buildSeoDescription, cleanText, createMetadata, toAbsoluteUrl} from "@/lib/seo";

type ProductSeoData = {
  id?: {toString(): string} | string | number | bigint | null;
  title?: string | null;
  description?: string | null;
  Brand?: {
    name?: string | null;
  } | null;
  Category?: {
    title?: string | null;
    name?: string | null;
  } | null;
  Variants?: Array<{
    price?: unknown;
    final_price?: unknown;
  }> | null;
  Images?: Array<{
    Image?: {
      src?: string | null;
    } | null;
  }> | null;
};

type ProductJsonLd = Record<string, unknown>;

function isString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

function getPriceAmount(value: unknown) {
  const amount = Number(String(value ?? ""));

  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function formatPrice(value: unknown) {
  const amount = getPriceAmount(value);

  if (!amount) return null;

  return `${amount.toLocaleString("ru-RU", {maximumFractionDigits: 2})} BYN`;
}

function productImageUrl(src?: string | null) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;

  const imageDomain = process.env.AWS_IMAGE_DOMAIN;
  return imageDomain ? `${imageDomain}/${src}` : null;
}

function getProductPrice(product: ProductSeoData) {
  for (const variant of product.Variants ?? []) {
    for (const candidate of [variant?.final_price, variant?.price]) {
      if (getPriceAmount(candidate) !== null) return candidate;
    }
  }

  return undefined;
}

export function createMissingProductMetadata(path: string) {
  return createMetadata({
    title: "Товар не найден",
    description: "Товар на spraby не найден или снят с публикации.",
    path,
    noIndex: true,
  });
}

export function createProductMetadata(product: ProductSeoData, path: string) {
  const productTitle = cleanText(product.title);
  const brandName = cleanText(product.Brand?.name);
  const categoryTitle = cleanText(product.Category?.title || product.Category?.name);
  const price = formatPrice(getProductPrice(product));
  const title = [productTitle, brandName ? `от ${brandName}` : null].filter(Boolean).join(" ");
  const fallbackDescription = [
    `Купить ${productTitle}${brandName ? ` от ${brandName}` : ""} на spraby`,
    categoryTitle ? `категория: ${categoryTitle}` : null,
    price ? `цена: ${price}` : null,
    "авторские товары от мастеров и независимых брендов",
  ].filter(Boolean).join(". ");
  const image = productImageUrl(product.Images?.[0]?.Image?.src);

  return createMetadata({
    title,
    description: buildSeoDescription(product.description, fallbackDescription),
    path,
    image,
  });
}

export function buildProductJsonLd(product: ProductSeoData, path: string): ProductJsonLd | null {
  const productTitle = cleanText(product.title);
  if (!productTitle) return null;

  const brandName = cleanText(product.Brand?.name);
  const categoryTitle = cleanText(product.Category?.title || product.Category?.name);
  const price = getPriceAmount(getProductPrice(product));
  const url = toAbsoluteUrl(path);
  const images = (product.Images ?? [])
    .map((item) => productImageUrl(item?.Image?.src))
    .filter(isString);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productTitle,
    description: buildSeoDescription(product.description, productTitle),
    sku: product.id?.toString(),
    category: categoryTitle || undefined,
    image: images.length ? images : undefined,
    brand: brandName ? {
      "@type": "Brand",
      name: brandName,
    } : undefined,
    offers: price && url ? {
      "@type": "Offer",
      url,
      price: price.toFixed(2),
      priceCurrency: "BYN",
      availability: product.Variants?.length ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    } : undefined,
  };
}

export function stringifyJsonLd(value: ProductJsonLd) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
