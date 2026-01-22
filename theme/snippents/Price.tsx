'use client';

import {toMoney} from "@/services/utilits";
import {useMemo} from "react";

const SIZES: { [key: string]: string[] } = {
  'sm': ['text-sm', 'text-xs'],
  'base': ['text-base', 'text-sm'],
  'lg': ['text-lg', 'text-base'],
  'xl': ['text-xl', 'text-lg'],
  '2xl': ['text-2xl', 'text-xl'],
  '3xl': ['text-3xl', 'text-2xl']
}

const Price = ({finalPrice, price, size = '2xl'}: Props) => {

  const finalPriceMarkup = useMemo(() => {
    const value = toMoney(finalPrice).split('.');
    return value?.length === 2 ? <span>
      <span className={`${SIZES[size][0]} font-semibold`}>{value[0]}.</span>
      <span className={`${SIZES[size][1]} font-semibold`}>{value[1]}</span>
    </span> : undefined;
  }, [finalPrice])

  const priceMarkup = useMemo(() => {
    if (!price || finalPrice >= price) return undefined;
    const value = toMoney(price).split('.');
    return value?.length === 2 ? <span className={'line-through-block'}>
      <span className={`${SIZES[size][0]} text-gray-400`}>{value[0]}.</span>
      <span className={`${SIZES[size][1]} text-gray-400`}>{value[1]}</span>
    </span> : undefined;
  }, [price, finalPrice])

  return <span className={'flex gap-3 items-baseline'}>
    {finalPriceMarkup}
    {priceMarkup}
  </span>
};

type Props = {
  finalPrice: number,
  price?: number
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
};

export default Price;
