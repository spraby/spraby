'use server'
import db from "@/prisma/db.client";
import Prisma, {OptionsModel} from "@/prisma/types";
import {transliterate as tr} from "transliteration";
import {FilterItem} from "@/types";

/**
 *
 * @param params
 */
export async function findFirst(params?: Prisma.OptionsFindFirstArgs): Promise<OptionsModel | null> {
  return db.options.findFirst(params)
}

/**
 *
 * @param params
 * @param conditions
 */
export async function getPage(params = {limit: 10, page: 1, search: ''}, conditions?: Prisma.OptionsFindManyArgs) {
  const where = {
    ...(conditions?.where ?? {}),
    ...(params?.search?.length ? {
      OR: [
        {name: {contains: params.search, mode: 'insensitive'}},
        {title: {contains: params.search, mode: 'insensitive'}}
      ]
    } : {})
  } as Prisma.OptionsWhereInput

  conditions = conditions ? {...conditions, ...(Object.keys(where).length ? {where} : {})} : (Object.keys(where).length ? {where} : {})

  const total = await db.options.count({where: where})

  const items = await db.options.findMany({
    orderBy: {
      createdAt: 'desc',
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
 * @param options
 */
export async function convertOptionsToFilter(options: OptionsModel[]) {
  const filter: FilterItem[] = []

  options.map(option => ({
    title: option.title,
    key: tr(option.title).toLowerCase(),
    values: option.values.map(value => ({
      value: value,
      optionIds: [option.id]
    }))
  })).map(optionItem => {
    const filterItem = filter.find(i => i.key === optionItem.key);

    if (filterItem) {
      optionItem.values.map(optionItemValue => {
        const optionId = optionItemValue.optionIds[0];
        const value = optionItemValue.value;

        const filterValue = filterItem.values.find((i) => i.value === value)

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
