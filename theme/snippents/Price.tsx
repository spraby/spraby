'use client';

import {toMoney} from "@/services/utilits";
import {useMemo} from "react";

const Price = ({finalPrice, price}: Props) => {

  const finalPriceMarkup = useMemo(() => {
    const value = toMoney(finalPrice).split('.');
    return value?.length === 2 ? <span>
      <span className='text-2xl font-semibold'>{value[0]}.</span>
      <span className='text-1xl font-semibold'>{value[1]}</span>
    </span> : undefined;
  }, [finalPrice])

  const priceMarkup = useMemo(() => {
    if (finalPrice >= price) return undefined;
    const value = toMoney(price).split('.');
    return value?.length === 2 ? <span className={'line-through-block'}>
      <span className='text-2xl text-gray-400'>{value[0]}.</span>
      <span className='text-1xl text-gray-400'>{value[1]}</span>
    </span> : undefined;
  }, [price, finalPrice])

  return <span className={'flex gap-3'}>
    {priceMarkup}
    {finalPriceMarkup}
  </span>
};

type Props = {
  finalPrice: number,
  price: number
};

export default Price;
