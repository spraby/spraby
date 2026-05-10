'use client';

import Money from "@/theme/snippents/Money";

type PriceSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';

const PRICE_SIZES: Record<PriceSize, string> = {
  'xs': 'text-xs',
  'sm': 'text-sm',
  'base': 'text-base',
  'lg': 'text-lg',
  'xl': 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl'
};

const OLD_PRICE_SIZES: Record<PriceSize, string> = {
  'xs': 'text-[11px]',
  'sm': 'text-xs',
  'base': 'text-xs',
  'lg': 'text-sm',
  'xl': 'text-base',
  '2xl': 'text-xl',
  '3xl': 'text-2xl'
};

type Props = {
  finalPrice: number;
  price?: number;
  size?: PriceSize;
  finalPriceClassName?: string;
};

const Price = ({finalPrice, price, size = '2xl', finalPriceClassName = 'text-purple-500'}: Props) => {
  const showOldPrice = !!price && finalPrice < price;

  return (
    <span className="flex gap-3 items-baseline">
      <Money
        value={finalPrice}
        className={`${finalPriceClassName} ${PRICE_SIZES[size]} font-semibold`}
      />
      {showOldPrice && (
        <Money
          value={price}
          showIcon={false}
          className={`line-through-block text-gray-400 ${OLD_PRICE_SIZES[size]}`}
        />
      )}
    </span>
  );
};

export default Price;
