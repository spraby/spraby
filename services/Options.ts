'use server'
import db from "@/prisma/db.client";
import Prisma, {OptionModel} from "@/prisma/types";
import {transliterate as tr} from "transliteration";
import {FilterGroup, FilterItem} from "@/types";

/**
 *
 * @param params
 */
export async function findFirst(params?: Prisma.optionsFindFirstArgs): Promise<OptionModel | null> {
  return db.options.findFirst(params)
}

/**
 *
 * @param params
 * @param conditions
 */
export async function getPage(params = {limit: 10, page: 1, search: ''}, conditions?: Prisma.optionsFindManyArgs) {
  const where = {
    ...(conditions?.where ?? {}),
    ...(params?.search?.length ? {
      OR: [
        {name: {contains: params.search, mode: 'insensitive'}},
        {title: {contains: params.search, mode: 'insensitive'}}
      ]
    } : {})
  } as Prisma.optionsWhereInput

  conditions = conditions ? {...conditions, ...(Object.keys(where).length ? {where} : {})} : (Object.keys(where).length ? {where} : {})

  const total = await db.options.count({where: where})

  const items = await db.options.findMany({
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
 * @param option
 */
export async function convertOptionsToFilter(option: OptionModel[]) {
  const filter: FilterItem[] = []

  option.map(option => ({
    title: option.title,
    key: tr(option.title).toLowerCase(),
    values: (option.Values ?? []).map(value => ({
      value: value.value,
      optionIds: [option.id]
    }))
  })).map(optionItem => {
    const filterItem = filter.find(i => i.key === optionItem.key);

    if (filterItem) {
      optionItem.values.map(optionItemValue => {
        const optionId = optionItemValue.optionIds[0];
        const value = optionItemValue.value;

        const filterValue = filterItem.values.find(i => i.value === value)

        if (filterValue) {
          if (!filterValue.optionIds.includes(optionId)) filterValue.optionIds.push(optionId)
        } else {
          filterItem.values.push({value: value, optionIds: [optionId]})
        }
      })
    } else {
      filter.push(optionItem)
    }
  })

  return filter;
}

/**
 * Convert URL search params into filter groups for the products query.
 *
 * Returns one FilterGroup per UI filter key. Inside a group, the same selected
 * value may produce multiple clauses (one per option_id it belongs to) — these
 * are combined with OR by the consumer. Different groups are combined with AND.
 */
export async function convertSearchParamsToQueryParams(searchParams: {
  [key: string]: string | number
}, filter: FilterItem[]): Promise<FilterGroup[]> {
  const groups: FilterGroup[] = [];

  Object.entries(searchParams).forEach(([key, rawValue]) => {
    const filterItem = filter.find(i => i.key === key);
    if (!filterItem) return;

    const selectedValues = `${rawValue}`.split(',').map(v => v.trim()).filter(Boolean);
    if (!selectedValues.length) return;

    const byOptionId = new Map<string, Set<string>>();

    selectedValues.forEach(val => {
      const filterValue = filterItem.values.find(i => i.value === val);
      if (!filterValue) return;
      filterValue.optionIds.forEach(id => {
        const optionKey = `${id}`;
        if (!byOptionId.has(optionKey)) byOptionId.set(optionKey, new Set());
        byOptionId.get(optionKey)!.add(filterValue.value);
      });
    });

    if (!byOptionId.size) return;

    groups.push({
      key,
      clauses: Array.from(byOptionId.entries()).map(([optionId, values]) => ({
        optionId,
        values: Array.from(values),
      })),
    });
  });

  return groups;
}
