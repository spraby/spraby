'use server'
import db from "@/prisma/db.client";
import {handlePrismaError} from "@/prisma/safeCall";
import {BreadcrumbItem, MenuItem} from "@/types";

/**
 *
 */
export async function getMainMenu(): Promise<MenuItem[]> {
  try {
    const settings = await db.settings.findUnique({where: {key: 'menu'}});
    return (settings?.data as MenuItem[]) ?? [];
  } catch (error) {
    return handlePrismaError<MenuItem[]>(error, [], 'settings.getMainMenu');
  }
}

/**
 *
 */
export async function getInformationSettings(): Promise<Record<string, unknown>> {
  try {
    const settings = await db.settings.findUnique({where: {key: 'information'}});
    return (settings?.data as Record<string, unknown>) ?? {};
  } catch (error) {
    return handlePrismaError<Record<string, unknown>>(error, {}, 'settings.getInformationSettings');
  }
}

export async function getBreadcrumbs(currentUrl: string): Promise<any | null> {
  function findPath(menu: MenuItem[], currentUrl: string): MenuItem[] {
    for (const item of menu) {
      if (item.url === currentUrl)         return [item];
      if (item.children) {
        const pathInChildren = findPath(item.children, currentUrl);
        if (pathInChildren.length > 0)           return [item, ...pathInChildren];
      }
    }
    return [];
  }

  const menu = await getMainMenu();

  const homeCrumb: BreadcrumbItem = { title: 'Spraby', url: '/' };
  const foundPath = findPath(menu, currentUrl);
  if (foundPath.length === 0)     return [homeCrumb];
  const breadcrumbs = foundPath.map(item => ({
    title: item.title,
    url: item.url,
  }));

  return [homeCrumb, ...breadcrumbs];
}
