'use client'

import Filter from "@/theme/snippents/Filter";
import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {isEqual} from "lodash";

const FilterPanel = ({options, searchParams: defaultSearchParams, onChange: onChangeFilter}: Props) => {
  const router = useSearchParams()
  const [searchParams, setSearchParams] = useState(defaultSearchParams)

  useEffect(() => {
    const params: any = {}
    router.forEach((value, key) => {
      params[key] = value
    })
    if (!isEqual(params, searchParams)) {
      setSearchParams(params);
      onChangeFilter(params)
    }
  }, [router]);

  const onChange = (active: boolean, item: any, filter: any) => {
    let url = new URL(window.location.href);
    const values = (url.searchParams.get(filter.key) ?? '').split(',').filter(i => !!i.length)

    if (active) {
      if (!values.includes(item.value)) {
        values.push(item.value);
        url.searchParams.set(filter.key, values.join(','));
      }
    } else if (!!values?.length) {
      const params = values.filter(i => i !== item.value).join(',')
      url.searchParams.set(filter.key, params);
      if (!params?.length) url.searchParams.delete(filter.key)
    }
    window.history.replaceState(null, '', url);
  }

  return <div className={'flex flex-col gap-5'}>
    {
      options.map((filter, index) => (
        <Filter
          selected={(searchParams[filter.key] ?? '').split(',')}
          key={index}
          filter={filter}
          onChange={(active: boolean, item: any) => onChange(active, item, filter)}
        />
      ))
    }
  </div>
};

type Props = {
  searchParams: any,
  options: any[],
  onChange: any
};

export default FilterPanel;
