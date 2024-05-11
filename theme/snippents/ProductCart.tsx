import Image from 'next/image';
import Link from 'next/link';
import {ProductModel} from "@/prisma/types";

/**
 *
 * @param product
 * @constructor
 */
const ProductCart = ({product}: Props) => {
  return (
    <div className='flex gap-2 p-2 flex-col'>
      <Link href={`/products/${product.id}`}>
        <div className='aspect-square bg-white rounded-md'>
          {
            product.Images?.length &&
            <Image
              style={{aspectRatio: 1, objectFit: 'cover', borderRadius: '0.375rem'}}
              width={500}
              height={500}
              src={product.Images[0]?.Image?.src as string}
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
        {
          // <div>
          //   <div>{product.Brand?.User?.email}</div>
          //   <div className={'flex flex-col gap-2'}>
          //     {
          //       product.Variants?.map(variant => {
          //         const optionIds = product.Category?.Options?.map(i => i.id);
          //
          //         return <div className={'flex gap-2'}>
          //           {
          //             variant.Values?.map(i => {
          //               const isActive = optionIds?.includes(i.Value?.optionId as string);
          //               return <div className={!isActive ? 'text-red-500' : ''}>{i.Value?.value}</div>
          //             })
          //           }
          //         </div>
          //       })
          //     }
          //   </div>
          // </div>
        }
        {
          // <div className='flex gap-2 items-center'>
          //   <span className='text-xs text-gray-400 line-through'>{product.price}</span>
          //   <span className='text-base font-semibold text-purple-500'>{product.discountPrice}</span>
          // </div>
        }
      </div>
    </div>
  );
};

export default ProductCart;

type Props = {
  product: ProductModel
};
