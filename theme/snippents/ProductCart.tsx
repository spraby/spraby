import Image from 'next/image';
import Link from 'next/link';
import {ProductCardModel, VariantModel} from "@/prisma/types";
import {setStatistic} from "@/services/ProductStatistics";
import {useEffect, useMemo, useState} from "react";

const toIdString = (value: unknown) => {
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') return value;
  return '';
};

const normalizeImageSrc = (raw?: string | null) => {
  if (!raw) return null;
  const value = raw.trim();
  if (!value.length) return null;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return value;
  return `/${value.replace(/^\.?\//, '')}`;
};

/**
 *
 * @param product
 * @constructor
 */
const ProductCart = ({product}: Props) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = useMemo(() => {
    const seen = new Set<string>();

    return (product.Images ?? []).reduce<Array<{
      key: string
      src: string
      productImageId: string
      sourceImageId: string
    }>>((acc, image, index) => {
      const src = normalizeImageSrc(image?.Image?.src);
      if (!src) return acc;

      const productImageId = toIdString(image?.id);
      const sourceImageId = toIdString(image?.image_id);
      const key = productImageId || sourceImageId || `${String(product.id)}-${index}-${src}`;
      if (seen.has(key)) return acc;

      seen.add(key);
      acc.push({
        key,
        src,
        productImageId,
        sourceImageId,
      });

      return acc;
    }, []);
  }, [product.Images, product.id]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  useEffect(() => {
    if (!images.length) {
      if (activeImageIndex !== 0) setActiveImageIndex(0);
      return;
    }

    if (activeImageIndex > images.length - 1) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, images.length]);

  const handleProductClick = () => {
    setStatistic(product.id, 'click').then();
  };

  const activeImage = images[activeImageIndex] ?? images[0];

  const activeVariant = useMemo(() => {
    if (!activeImage) return undefined;

    const imageIds = [activeImage.productImageId, activeImage.sourceImageId].filter(Boolean);
    if (!imageIds.length) return undefined;

    return (product.Variants ?? []).find((variant: VariantModel) => {
      const variantImageId = toIdString(variant.image_id);
      return !!variantImageId && imageIds.includes(variantImageId);
    });
  }, [activeImage, product.Variants]);

  const productHref = useMemo(() => {
    const variantId = toIdString(activeVariant?.id);
    return variantId.length
      ? `/products/${product.id}?variantId=${variantId}`
      : `/products/${product.id}`;
  }, [activeVariant?.id, product.id]);

  const currentPrice = `${activeVariant?.price ?? product.price ?? 0}`;
  const currentFinalPrice = `${activeVariant?.final_price ?? product.final_price ?? currentPrice}`;

  const hasDiscount = Number(currentPrice) > Number(currentFinalPrice);
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(currentFinalPrice) / Number(currentPrice)) * 100)
    : 0;
  const brandName =
    (product.Brand?.name && product.Brand.name.trim()) ||
    [product.Brand?.User?.first_name, product.Brand?.User?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();
  const variantTitle = typeof activeVariant?.title === 'string' ? activeVariant.title.trim() : '';
  const metaText = [brandName, variantTitle].filter(Boolean).join(' · ');

  return (
    <div className='flex flex-col gap-2 p-2'>
      <div className='relative'>
        <Link href={productHref} onClick={handleProductClick}>
          <div className='relative aspect-square overflow-hidden rounded-[0.375rem] border border-gray-200/60 bg-white'>
            {
              activeImage?.src &&
              <div className='relative h-full w-full'>
                <Image
                  fill
                  className='h-full w-full object-cover'
                  sizes={'(max-width: 768px) 50vw, (max-width: 1280px) 20vw, 14vw'}
                  src={activeImage.src}
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
        {
          images.length > 1 && (
            <div className='pointer-events-none absolute inset-x-2 bottom-2 z-10 flex gap-1'>
              {images.map((image, index) => (
                <button
                  key={image.key}
                  type='button'
                  aria-label={`Показать изображение ${index + 1} товара ${product.title}`}
                  aria-pressed={activeImageIndex === index}
                  onMouseEnter={() => setActiveImageIndex(index)}
                  onFocus={() => setActiveImageIndex(index)}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setActiveImageIndex(index);
                  }}
                  className={`pointer-events-auto h-1.5 flex-1 rounded-full transition ${activeImageIndex === index ? 'bg-white shadow-sm' : 'bg-white/55 hover:bg-white/80'}`}
                />
              ))}
            </div>
          )
        }
      </div>
      <div className='flex flex-col gap-1'>
        <h3 className='text-sm font-medium text-gray-900'>
          <Link className='block truncate' href={productHref} onClick={handleProductClick}>{product.title}</Link>
        </h3>
        {
          !!metaText &&
          <p className='text-xs text-gray-500 truncate'>{metaText}</p>
        }
        {
          <div className='mt-1 flex items-baseline gap-2'>
            <span className='text-base font-semibold text-purple-500'>{+currentFinalPrice} BYN</span>
            {
              +currentPrice > +currentFinalPrice &&
              <span className="text-xs text-gray-400 line-through">{+currentPrice}</span>
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
