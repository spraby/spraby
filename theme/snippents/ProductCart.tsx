import Image from 'next/image';
import Link from 'next/link';

/**
 *
 * @param product
 * @constructor
 */
const ProductCart = ({ product }: Props) => {
  return (
    <div className='flex gap-2 p-2 flex-col'>
      <Link href={`/products/${product.id}`}>
        <div className='aspect-square bg-white rounded-md'>
          {
            product.images?.length &&
            <Image
              style={{ aspectRatio: 1, objectFit: 'cover', borderRadius: '0.375rem' }}
              width={500}
              height={500}
              src={product.images[0].src.replace('https://api.spra.by/', 'http://api:3002/')}
              alt={product.title}
            />
          }
        </div>
      </Link>
      <div className='flex flex-col'>
        <h3 className='text-sm'>
          <Link href={`/products/${product.id}`}> {product.title} </Link>
        </h3>
        <h4 className='text-xs'>{product.description}</h4>
        <div className='flex gap-2 items-center'>
          <span className='text-xs text-gray-400 line-through'>{product.price}</span>
          <span className='text-base font-semibold text-purple-500'>{product.discountPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCart;

type Props = {
  product: any
};
