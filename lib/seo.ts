import type {Metadata} from "next";

export const SITE_NAME = "spraby";
export const DEFAULT_SITE_URL = "https://spra.by";

const TITLE_MAX_LENGTH = 62;
const DESCRIPTION_MAX_LENGTH = 158;

export const DEFAULT_TITLE = "spraby - маркетплейс авторских товаров";
export const DEFAULT_DESCRIPTION =
  "spraby - маркетплейс авторских товаров, изделий ручной работы и независимых брендов. Находите уникальные вещи и заказывайте онлайн.";

type SeoMetadataInput = {
  title?: string | null;
  description?: string | null;
  path?: string | null;
  image?: string | null;
  noIndex?: boolean;
  follow?: boolean;
};

export function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  try {
    return new URL(rawUrl);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function isIndexingAllowed() {
  return process.env.NEXT_PUBLIC_ALLOW_INDEXING?.toLowerCase() === "true";
}

export function cleanText(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value: string, maxLength: number) {
  const text = cleanText(value);

  if (text.length <= maxLength) return text;

  const hardCut = text.slice(0, Math.max(0, maxLength - 3)).trim();
  const lastSpace = hardCut.lastIndexOf(" ");
  const readableCut = lastSpace > maxLength * 0.65 ? hardCut.slice(0, lastSpace) : hardCut;

  return `${readableCut.trim()}...`;
}

function hasBrand(value: string) {
  return /\bspraby\b/i.test(value) || /\bspra\.by\b/i.test(value);
}

export function buildSeoTitle(title?: string | null) {
  const baseTitle = cleanText(title) || DEFAULT_TITLE;

  if (hasBrand(baseTitle)) {
    return truncateText(baseTitle, TITLE_MAX_LENGTH);
  }

  const suffix = ` | ${SITE_NAME}`;
  return `${truncateText(baseTitle, TITLE_MAX_LENGTH - suffix.length)}${suffix}`;
}

export function buildSeoDescription(description?: string | null, fallback = DEFAULT_DESCRIPTION) {
  return truncateText(cleanText(description) || fallback, DESCRIPTION_MAX_LENGTH);
}

export function toAbsoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return undefined;

  try {
    return new URL(pathOrUrl).toString();
  } catch {
    const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    return new URL(path, getSiteUrl()).toString();
  }
}

export function createMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
  follow,
}: SeoMetadataInput = {}): Metadata {
  const seoTitle = buildSeoTitle(title);
  const seoDescription = buildSeoDescription(description);
  const canonicalUrl = path ? toAbsoluteUrl(path) : undefined;
  const imageUrl = toAbsoluteUrl(image);
  const shouldNoIndex = noIndex || !isIndexingAllowed();
  const shouldFollow = follow ?? !shouldNoIndex;

  return {
    metadataBase: getSiteUrl(),
    title: {
      absolute: seoTitle,
    },
    description: seoDescription,
    alternates: canonicalUrl ? {
      canonical: canonicalUrl,
    } : undefined,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "ru_RU",
      type: "website",
      images: imageUrl ? [{url: imageUrl}] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: seoTitle,
      description: seoDescription,
      images: imageUrl ? [imageUrl] : undefined,
    },
    robots: shouldNoIndex ? {
      index: false,
      follow: shouldFollow,
      googleBot: {
        index: false,
        follow: shouldFollow,
      },
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function categoryDescription(title?: string | null, description?: string | null) {
  const categoryTitle = cleanText(title).toLowerCase();
  const fallback = categoryTitle
    ? `Выбирайте ${categoryTitle} от мастеров и независимых брендов на spraby: авторские товары, ручная работа и удобный заказ онлайн.`
    : DEFAULT_DESCRIPTION;

  return buildSeoDescription(description, fallback);
}

export function collectionDescription(title?: string | null, description?: string | null) {
  const collectionTitle = cleanText(title);
  const fallback = collectionTitle
    ? `${collectionTitle} на spraby: подборка авторских товаров, изделий ручной работы и вещей от независимых брендов.`
    : DEFAULT_DESCRIPTION;

  return buildSeoDescription(description, fallback);
}
