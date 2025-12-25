'use server'
import db from "@/prisma/db.client";
import Prisma, {CategoryModel, OptionModel} from "@/prisma/types";
import {handlePrismaError, safePrismaCall} from "@/prisma/safeCall";

/**
 *
 * @param params
 */
export async function findFirst(params?: Prisma.categoriesFindFirstArgs): Promise<CategoryModel | null> {
  return db.categories.findFirst(params)
}

/**
 *
 * @param params
 * @param conditions
 */
export async function getPage(params = {limit: 10, page: 1, search: ''}, conditions?: Prisma.categoriesFindManyArgs) {
  const where = {
    ...(conditions?.where ?? {}),
    ...(params?.search?.length ? {
      OR: [
        {name: {contains: params.search, mode: 'insensitive'}},
        {title: {contains: params.search, mode: 'insensitive'}}
      ]
    } : {})
  } as Prisma.categoriesWhereInput

  conditions = conditions ? {...conditions, ...(Object.keys(where).length ? {where} : {})} : (Object.keys(where).length ? {where} : {})

  const total = await db.categories.count({where: where})

  const items = await db.categories.findMany({
    orderBy: {
      created_at: 'desc',
    },
    ...conditions,
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  })

  return {
    items,
    paginator: {pageSize: params.limit, current: params.page, total, pages: Math.ceil(total / params.limit)},
  }
}

/**
 *
 * @param where
 */
export async function getOptions(where: Prisma.categoriesWhereInput) {
  try {
    const category = await findFirst({
      where,
      include: {
        CategoryOption: {
          include: {
            Option: {
              include: {
                Values: true
              }
            }
          }
        }
      }
    })

    return (category?.CategoryOption ?? []).reduce((acc: OptionModel[], categoryOption) => {
      if (!acc?.find(i => i.id === categoryOption.Option.id)) acc.push(categoryOption.Option)
      return acc;
    }, [])

  } catch (e) {
    return [];
  }
}

export async function getPopularCategoriesByViews(limit = 6) {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const viewCounts = await safePrismaCall(
      () => db.productStatistics.groupBy({
        by: ['product_id'],
        where: {
          type: 'view',
          created_at: {gte: since},
        },
        _count: {product_id: true},
        orderBy: {_count: {product_id: 'desc'}},
        take: 300,
      }),
      [],
      'categories.popular.views'
    );

    const productIds = viewCounts.map(v => typeof v.product_id === 'bigint' ? v.product_id : BigInt(v.product_id));
    if (!productIds.length) return [];

    const products = await safePrismaCall(
      () => db.products.findMany({
        where: {id: {in: productIds}},
        include: {
          Category: true,
        },
      }),
      [],
      'categories.popular.products'
    );

    const productMap = new Map(products.map(p => [p.id?.toString(), p]));
    const categoryTotals = new Map<string, {title: string; handle: string; count: number}>();

    for (const row of viewCounts) {
      const product = productMap.get(row.product_id.toString());
      const category = product?.Category;
      if (!category?.handle) continue;
      const key = category.handle;
      const existing = categoryTotals.get(key);
      const count = row._count?.product_id ?? 0;
      if (existing) {
        existing.count += count;
      } else {
        categoryTotals.set(key, {
          title: category.title || category.name || category.handle,
          handle: category.handle,
          count,
        });
      }
    }

    return Array.from(categoryTotals.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => ({
        id: item.handle,
        title: item.title,
        href: `/categories/${item.handle}`,
      }));
  } catch (error) {
    return handlePrismaError(error, [], 'categories.getPopularCategoriesByViews');
  }
}
