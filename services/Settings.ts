'use server'
import db from "@/prisma/db.client";

/**
 *
 */
export async function getMainMenu(): Promise<any | null> {
  const settings = await db.settings.findFirst();
  return settings?.mainMenu ?? [];
}


