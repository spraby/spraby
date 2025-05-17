'use server'
import db from "@/prisma/db.client";

/**
 *
 */
export async function getMainMenu(): Promise<any | null> {
  const settings = await db.settings.findUnique({where: {key: 'menu'}});
  return settings?.data ?? [];
}

/**
 *
 */
export async function getInformationSettings(): Promise<any | null> {
  const settings = await db.settings.findUnique({where: {key:'information'}});
  return settings?.data ?? {};
}

