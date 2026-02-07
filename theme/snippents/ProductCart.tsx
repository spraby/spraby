import Image from 'next/image';
import Link from 'next/link';
import {ProductCardModel} from "@/prisma/types";
import {setStatistic} from "@/services/ProductStatistics";

/**
 *
 * @param product
 * @constructor
 */
const ProductCart = ({product}: Props) => {

  const onClick = () => {
    setStatistic(product.id, 'click').then();
  }

  const hasDiscount = Number(product.price) > Number(product.final_price);
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.final_price) / Number(product.price)) * 100)
    : 0;
  const brandName =
    (product.Brand?.name && product.Brand.name.trim()) ||
    [product.Brand?.User?.first_name, product.Brand?.User?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

  return (
    <div className='flex flex-col gap-2 p-2' onClick={onClick}>
      <Link href={`/products/${product.id}`}>
        <div className='relative aspect-square overflow-hidden rounded-[0.375rem] border border-gray-200/60 bg-white'>
          {
            product.Images?.length &&
            <div className='relative h-full w-full'>
              <Image
                fill
                className='h-full w-full object-cover'
                sizes={'(max-width: 768px) 50px, 20px'}
                src={product.Images[0]?.Image?.src as string}
                alt={product.title}
              />
            </div>
          }
          {
            hasDiscount && discountPercent > 0 && (
              <span className='absolute right-2 top-2 inline-flex items-center rounded-[0.375rem] bg-purple-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm'>
                -{discountPercent}%
              </span>
            )
          }
        </div>
      </Link>
      <div className='flex flex-col gap-1'>
        <h3 className='text-sm font-medium text-gray-900'>
          <Link className='block truncate' href={`/products/${product.id}`}>{product.title}</Link>
        </h3>
        {
          !!brandName &&
          <p className='text-xs text-gray-500 truncate'>{brandName}</p>
        }
        {
          <div className='mt-1 flex items-baseline gap-2'>
            <span className='text-base font-semibold text-purple-500'>{+product.final_price} BYN</span>
            {
              +product.price > +product.final_price &&
              <span className="text-xs text-gray-400 line-through">{+product.price}</span>
            }
          </div>
        }
      </div>
    </div>
  );
};

export default ProductCart;

type Props = {
  product: ProductCardModel
};
