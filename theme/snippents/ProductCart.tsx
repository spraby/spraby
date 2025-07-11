import Image from 'next/image';
import Link from 'next/link';
import {ProductModel} from "@/prisma/types";
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

  return (
    <div className='flex gap-2 p-2 flex-col' onClick={onClick}>
      <Link href={`/products/${product.id}`}>
        <div className='aspect-square bg-white rounded-md'>
          {
            product.Images?.length &&
            <div className={'relative w-full h-full'}>
              <Image
                style={{aspectRatio: 1, objectFit: 'contain', borderRadius: '10px'}}
                fill
                sizes={'(max-width: 768px) 300px, 200px'}
                src={product.Images[0]?.Image?.src as string}
                alt={product.title}
              />
            </div>
          }
        </div>
      </Link>
      <div className='flex flex-col'>
        <h3 className='text-sm'>
          <Link href={`/products/${product.id}`}> {product.title} </Link>
        </h3>
        {
          <div className='flex gap-2 items-center'>
            {
              +product.price > +product.final_price &&
              <span className="text-xs text-gray-400 line-through">{+product.price}</span>
            }
            <span className='text-base font-semibold text-purple-500'>{+product.final_price} BYN</span>
          </div>
        }
      </div>
    </div>
  );
};

export default ProductCart;

type Props = {
  product: ProductModel
};
