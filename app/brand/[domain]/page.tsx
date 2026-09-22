import {notFound} from "next/navigation";
import {cache} from "react";

import {BRAND_PAGE_SIZE} from "@/lib/brand-page";
import {isValidBrandPreviewToken} from "@/lib/brand-preview";
import {cleanText, createMetadata} from "@/lib/seo";
import {findByDomain, findPublishedByDomain, getBrandContacts} from "@/services/BrandPageData";
import {getFilteredProducts} from "@/services/Products";
import BrandPage from "@/theme/templates/BrandPage";

/**
 * Опубликованная страница — всем; неопубликованная — только по подписанной
 * ссылке превью из админки.
 */
const resolveBrand = cache(async (domain: string, previewToken?: string | null) => {
  const published = await findPublishedByDomain(domain);

  if (published) return {brand: published, isPreview: false};

  if (!isValidBrandPreviewToken(domain.trim().toLowerCase(), previewToken)) {
    return {brand: null, isPreview: false};
  }

  return {brand: await findByDomain(domain), isPreview: true};
});

export async function generateMetadata({params, searchParams}: any) {
  const {brand, isPreview} = await resolveBrand(params.domain, searchParams?.preview);

  if (!brand) {
    return createMetadata({
      title: "Бренд не найден",
      description: "Страница бренда на spraby не найдена.",
      path: `/brand/${params.domain}`,
      noIndex: true,
    });
  }

  const title = cleanText(brand.name);

  return createMetadata({
    title: title || "Страница бренда",
    description: cleanText(brand.about) || `Товары бренда ${title} на spraby.`,
    path: `/brand/${params.domain}`,
    // Черновик в поиске не нужен.
    noIndex: isPreview,
  });
}

export default async function Page({params, searchParams}: any) {
  const {brand, isPreview} = await resolveBrand(params.domain, searchParams?.preview);

  // Неопубликованная страница без валидного превью неотличима от несуществующей.
  if (!brand) {
    notFound();
  }

  const contacts = await getBrandContacts(brand.id);

  const {items: products, total} = await getFilteredProducts({
    brandId: Number(brand.id),
    limit: BRAND_PAGE_SIZE,
    page: 1,
  });

  // Домен S3 есть только на сервере, поэтому адрес логотипа собираем здесь.
  const logoUrl = brand.Image?.src
    ? `${process.env.AWS_IMAGE_DOMAIN}/${brand.Image.src}`
    : null;

  return (
    <BrandPage
      brand={brand}
      logoUrl={logoUrl}
      contacts={contacts}
      products={products}
      total={total}
      pageSize={BRAND_PAGE_SIZE}
      isPreview={isPreview}
    />
  );
}
