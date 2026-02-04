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
      if (categoryOption.Option && !acc?.find(i => i.id === categoryOption.Option?.id)) acc.push(categoryOption.Option)
      return acc;
    }, [])

  } catch (e) {
    return [];
  }
}

export async function getPopularCategoriesByViews(limit = 6) {
  try {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // Оптимизированный запрос с fallback: если нет статистики, используем количество товаров
    const results = await db.$queryRaw<
      Array<{
        category_handle: string;
        category_title: string;
        category_name: string;
        total_score: bigint;
      }>
    >`
      WITH ProductStats AS (
        SELECT
          p.id as product_id,
          p.category_id,
          COALESCE(COUNT(ps.id), 0) as stat_count
        FROM products p
        LEFT JOIN product_statistics ps ON ps.product_id = p.id
          AND ps.type = 'view'
          AND ps.created_at IS NOT NULL
        WHERE p.enabled = true
          AND p.category_id IS NOT NULL
        GROUP BY p.id, p.category_id
        ORDER BY stat_count DESC
        LIMIT 100
      ),
      CategoryTotals AS (
        SELECT
          c.handle as category_handle,
          c.title as category_title,
          c.name as category_name,
          COALESCE(SUM(ps.stat_count), COUNT(p.id)) as total_score
        FROM categories c
        INNER JOIN products p ON p.category_id = c.id AND p.enabled = true
        LEFT JOIN ProductStats ps ON ps.product_id = p.id
        WHERE c.handle IS NOT NULL
        GROUP BY c.id, c.handle, c.title, c.name
        ORDER BY total_score DESC
        LIMIT ${limit}
      )
      SELECT * FROM CategoryTotals
    `;

    return results.map(row => ({
      id: row.category_handle,
      title: row.category_title || row.category_name || row.category_handle,
      href: `/categories/${row.category_handle}`,
    }));
  } catch (error) {
    return handlePrismaError(error, [], 'categories.getPopularCategoriesByViews');
  }
}
