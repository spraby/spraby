import type {MetadataRoute} from "next";
import db from "@/prisma/db.client";
import {getSiteUrl, isIndexingAllowed} from "@/lib/seo";

export const dynamic = "force-dynamic";

const staticRoutes = [
  {path: "/", priority: 1},
  {path: "/new", priority: 0.8},
  {path: "/trending", priority: 0.8},
  {path: "/about", priority: 0.4},
  {path: "/contacts", priority: 0.4},
  {path: "/register", priority: 0.5},
  {path: "/privacy-policy", priority: 0.2},
  {path: "/terms-of-use", priority: 0.2},
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexingAllowed()) return [];

  const siteUrl = getSiteUrl().origin;
  const now = new Date();

  const items: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    changeFrequency: route.path === "/" ? "daily" : "weekly",
    priority: route.priority,
  }));

  try {
    const [categories, collections, products] = await Promise.all([
      db.categories.findMany({
        select: {
          handle: true,
          updated_at: true,
        },
      }),
      db.collections.findMany({
        select: {
          handle: true,
          updated_at: true,
        },
      }),
      db.products.findMany({
        where: {
          enabled: true,
        },
        select: {
          id: true,
          updated_at: true,
        },
        orderBy: {
          updated_at: "desc",
        },
        take: 1000,
      }),
    ]);

    items.push(
      ...categories.map((category) => ({
        url: `${siteUrl}/categories/${category.handle}`,
        lastModified: category.updated_at ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...collections.map((collection) => ({
        url: `${siteUrl}/collections/${collection.handle}`,
        lastModified: collection.updated_at ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...products.map((product) => ({
        url: `${siteUrl}/products/${product.id.toString()}`,
        lastModified: product.updated_at ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    );
  } catch (error) {
    console.error("Failed to build sitemap", error);
  }

  return items;
}
