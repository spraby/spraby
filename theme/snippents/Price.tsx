'use client';

import {toMoney} from "@/services/utilits";
import BynCurrencyIcon from "@/theme/assets/BynCurrencyIcon";
import {useMemo} from "react";

type PriceSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';

const PRICE_SIZES: Record<PriceSize, string> = {
  'xs': 'text-xs',
  'sm': 'text-sm',
  'base': 'text-base',
  'lg': 'text-lg',
  'xl': 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl'
}

const OLD_PRICE_SIZES: Record<PriceSize, string> = {
  'xs': 'text-[11px]',
  'sm': 'text-xs',
  'base': 'text-xs',
  'lg': 'text-sm',
  'xl': 'text-base',
  '2xl': 'text-xl',
  '3xl': 'text-2xl'
}

const Price = ({finalPrice, price, size = '2xl'}: Props) => {

  const finalPriceMarkup = useMemo(() => {
    return <span className={`inline-flex items-baseline gap-1.5 text-purple-500 ${PRICE_SIZES[size]} font-semibold`}>
      <span>{toMoney(finalPrice)}</span>
      <BynCurrencyIcon className="h-[1cap] w-[0.81cap] shrink-0"/>
    </span>;
  }, [finalPrice, size])

  const priceMarkup = useMemo(() => {
    if (!price || finalPrice >= price) return undefined;
    return <span className={'line-through-block inline-flex items-baseline text-gray-400'}>
      <span className={OLD_PRICE_SIZES[size]}>{toMoney(price)}</span>
    </span>;
  }, [price, finalPrice, size])

  return <span className={'flex gap-3 items-baseline'}>
    {finalPriceMarkup}
    {priceMarkup}
  </span>
};

type Props = {
  finalPrice: number,
  price?: number
  size?: PriceSize
};

export default Price;
