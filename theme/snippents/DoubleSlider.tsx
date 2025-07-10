'use client';
// @ts-ignore
import {Splide, SplideSlide} from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import Image from 'next/image';
import {useEffect, useRef} from 'react';

const DoubleSlider = ({images, startImage = null}: Props) => {
  const main = useRef(null);
  const thumbnails = useRef(null);

  useEffect(() => {
    if (images?.length <= 1) return;
    // @ts-ignore
    if (main.current && thumbnails.current && thumbnails.current.splide) {
      // @ts-ignore
      main.current.sync(thumbnails.current.splide);
    }
    if (startImage) {
      const imageIndex = images.findIndex(i => i.includes(startImage));
      // @ts-ignore
      if (imageIndex != -1) thumbnails.current.go(imageIndex);
    }
  }, [images, startImage]);

  return (
    <div className='flex flex-col gap-4'>
      <Splide
        ref={main}
        options={{
          type: 'fade',
          heightRatio: 0.65,
          pagination: false,
          arrows: false,
          cover: false,
        }}
      >
        {
          images.map((image, index) => {
            return (
              <SplideSlide key={index}>
                <Image alt='' src={image} fill sizes="(max-width: 768px) 800px, 500px" objectFit={'contain'}
                       className={'rounded-[20px]'}/>
              </SplideSlide>
            );
          })
        }
      </Splide>

      {images.length > 1 && (
        <Splide
          ref={thumbnails}
          options={{
            rewind: true,
            fixedWidth: 104,
            fixedHeight: 104,
            isNavigation: true,
            gap: 10,
            focus: 'left',
            pagination: false,
            cover: true,
            arrows: false,
            dragMinThreshold: {
              mouse: 4,
              touch: 10,
            },
            breakpoints: {
              640: {
                fixedWidth: 66,
                fixedHeight: 38,
              },
            },
          }}
        >
          {images.map((image, index) => {
            return (
              <SplideSlide key={index}>
                <Image alt='' src={image} fill sizes="(max-width: 768px) 104px, 104px" objectFit={'contain'}/>
              </SplideSlide>
            );
          })}
        </Splide>
      )}
    </div>
  );
};

type Props = {
  images: string[];
  startImage?: string | null;
};

export default DoubleSlider;
