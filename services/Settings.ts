'use server'
import db from "@/prisma/db.client";
import {BreadcrumbItem, MenuItem} from "@/types";

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

