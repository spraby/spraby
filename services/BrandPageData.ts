/**
 * Запросы для страницы бренда.
 *
 * Модуль намеренно БЕЗ 'use server': в Next каждая экспортируемая функция
 * серверного модуля становится server action, то есть публично вызываемым
 * эндпоинтом. Эти запросы отдают в том числе неопубликованные страницы и
 * контакты продавцов, поэтому вызывать их можно только из серверного кода.
 */
import db from "@/prisma/db.client";
import {BrandModel} from "@/prisma/types";

/**
 * Бренд по домену его персональной страницы.
 * Отдаём только опубликованные: заявка может висеть на модерации,
 * а домен у бренда уже быть назначен.
 */
export async function findPublishedByDomain(domain: string): Promise<BrandModel | null> {
  const normalized = domain.trim().toLowerCase()

  if (!normalized) return null

  return db.brands.findFirst({
    where: {
      domain: normalized,
      page_status: 'published',
      page_published_at: {not: null},
    },
    include: {Image: true, brand_category: {include: {categories: true}}},
  })
}

/**
 * Бренд по хэндлу страницы без проверки публикации — только для превью.
 */
export async function findByDomain(domain: string): Promise<BrandModel | null> {
  const normalized = domain.trim().toLowerCase()

  if (!normalized) return null

  return db.brands.findFirst({
    where: {domain: normalized},
    include: {Image: true, brand_category: {include: {categories: true}}},
  })
}

/**
 * Контакты бренда. Связь морфная (contacts.contactable_*), поэтому
 * отдельным запросом, а не через include.
 */
export async function getBrandContacts(brandId: bigint | number) {
  return db.contacts.findMany({
    where: {
      contactable_type: 'App\\Models\\Brand',
      contactable_id: BigInt(brandId),
    },
    select: {type: true, value: true},
  })
}
