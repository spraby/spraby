'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Image from 'next/image';
import {Swiper, SwiperSlide} from 'swiper/react';
import type {Swiper as SwiperClass} from 'swiper';
import {EffectFade} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import {normalizeImageSrc} from '@/services/utilits';
import PhotoViewer from '@/theme/components/PhotoViewer';
import imageLoader from '@/lib/image-loader';

const DoubleSlider = ({images, startImage = null, onImageChange}: Props) => {
  const [mainSwiper, setMainSwiper] = useState<SwiperClass | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Просмотрщик работает с голыми src и сам решает, какую копию запросить.
  const viewerImages = useMemo(() => images.map(src => ({src})), [images]);

  useEffect(() => {
    if (!startImage || !mainSwiper || images.length <= 1) return;
    const normalizedStartImage = normalizeImageSrc(startImage);
    const imageIndex = images.findIndex(image => normalizeImageSrc(image) === normalizedStartImage);
    if (imageIndex !== -1) mainSwiper.slideTo(imageIndex);
  }, [images, startImage, mainSwiper]);

  const handleSlideChange = useCallback((swiper: SwiperClass) => {
    setActiveIndex(swiper.activeIndex);
    const nextImage = images[swiper.activeIndex];
    if (nextImage) onImageChange?.(nextImage, swiper.activeIndex);
  }, [images, onImageChange]);

  /**
   * Пока просмотрщик открыт, галерею на странице не трогаем: каждый slideTo
   * поднимал onImageChange в ProductPage, тот перерисовывал всё дерево, и
   * бесконечная лента внутри просмотрщика вставала после первого кадра.
   * Запоминаем последний кадр и синхронизируем страницу один раз, на закрытии.
   */
  const pendingViewerIndex = useRef<number | null>(null);

  const handleViewerIndexChange = useCallback((index: number) => {
    pendingViewerIndex.current = index;
  }, []);

  const handleViewerClose = useCallback(() => {
    setViewerOpen(false);
    const index = pendingViewerIndex.current;
    pendingViewerIndex.current = null;
    if (index !== null) mainSwiper?.slideTo(index);
  }, [mainSwiper]);

  /**
   * Превью связаны с главным слайдером вручную: модуль Thumbs вешает обработчик
   * клика при инициализации, когда лента превью ещё не смонтирована.
   */
  const handleThumbClick = useCallback((index: number) => {
    mainSwiper?.slideTo(index);
  }, [mainSwiper]);

  // Лента превью подкручивается к активному кадру при смене главного фото.
  useEffect(() => {
    thumbsSwiper?.slideTo(activeIndex);
  }, [activeIndex, thumbsSwiper]);

  return (
    <div className='product-gallery flex flex-col gap-4'>
      <Swiper
        modules={[EffectFade]}
        effect={images.length > 1 ? 'fade' : undefined}
        fadeEffect={{crossFade: true}}
        speed={500}
        slidesPerView={1}
        allowTouchMove={images.length > 1}
        onSwiper={setMainSwiper}
        onSlideChange={handleSlideChange}
        className='w-full'
      >
        {images.map((image, index) => (
          <SwiperSlide key={`${image}-${index}`}>
            <div
              className='relative w-full cursor-zoom-in'
              style={{aspectRatio: '1 / 0.65'}}
              onClick={() => setViewerOpen(true)}
            >
              <Image
                alt=''
                src={image}
                fill
                sizes='(max-width: 768px) 800px, 500px'
                className='rounded-[20px] object-contain'
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          slidesPerView='auto'
          spaceBetween={10}
          className='w-full'
        >
          {images.map((image, index) => (
            <SwiperSlide
              key={`${image}-${index}`}
              className='!w-[66px] !h-[66px] sm:!w-[104px] sm:!h-[104px] cursor-pointer'
              onClick={() => handleThumbClick(index)}
            >
              <div className={`relative h-full w-full transition-opacity ${index === activeIndex ? 'opacity-100' : 'opacity-60'}`}>
                <Image
                  alt=''
                  src={image}
                  fill
                  sizes='(max-width: 768px) 66px, 104px'
                  className='rounded-[0.5rem] object-cover'
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <PhotoViewer
        images={viewerImages}
        open={viewerOpen}
        initialIndex={activeIndex}
        onClose={handleViewerClose}
        onIndexChange={handleViewerIndexChange}
        imageLoader={(src, width) => imageLoader({src, width, quality: 100})}
      />
    </div>
  );
};

type Props = {
  images: string[];
  startImage?: string | null;
  onImageChange?: (image: string, index: number) => void;
};

export default DoubleSlider;
