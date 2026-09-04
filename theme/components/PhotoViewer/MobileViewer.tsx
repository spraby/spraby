'use client';

import {useCallback, useRef, useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import type {Swiper as SwiperClass} from 'swiper';
import {Zoom} from 'swiper/modules';
import {NormalizedImage, PhotoViewerImageLoader} from './types';

type Props = {
  images: NormalizedImage[]
  activeIndex: number
  onIndexChange: (index: number) => void
  onClose: () => void
  loadImage: PhotoViewerImageLoader
  onSwiper: (swiper: SwiperClass) => void
};

/** Пинч-зум: от 1x до 3x, как в нативных галереях. */
const ZOOM_MAX_RATIO = 3;
/** Ниже этого смещения тач считаем случайным и не двигаем слой. */
const DRAG_DEAD_ZONE_PX = 5;
/** Свайп закрывает либо по пройденному пути... */
const CLOSE_DISTANCE_PX = 120;
/** ...либо по скорости флика (px/ms). */
const CLOSE_VELOCITY = 0.5;
/** На какой дистанции UI полностью растворяется. */
const FADE_DISTANCE_PX = 300;
/** Насколько слой «отъезжает» при свайпе. */
const MAX_SCALE_DOWN = 0.05;
const SCALE_DISTANCE_PX = 2000;

const THUMB_WIDTH = 160;
const FULL_WIDTH = 2000;

export default function MobileViewer({images, activeIndex, onIndexChange, onClose, loadImage, onSwiper}: Props) {
  const swiperRef = useRef<SwiperClass | null>(null);
  /** Фиксируем стартовый кадр: живой проп в initialSlide откатывал бы слайдер. */
  const initialSlide = useRef(activeIndex).current;
  const startY = useRef(0);
  const startX = useRef(0);
  const startedAt = useRef(0);
  /** Вертикальный жест начат и перехвачен нами, а не листанием Swiper'а. */
  const dragActive = useRef(false);
  const [offsetY, setOffsetY] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Пока фото увеличено, вертикальный жест отдан панорамированию зума.
  const dragEnabled = !isZoomed;

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (!dragEnabled || event.touches.length !== 1) return;
    startY.current = event.touches[0].clientY;
    startX.current = event.touches[0].clientX;
    startedAt.current = Date.now();
    dragActive.current = false;
  }, [dragEnabled]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!dragEnabled || event.touches.length !== 1) return;
    const deltaY = event.touches[0].clientY - startY.current;
    const deltaX = event.touches[0].clientX - startX.current;
    if (Math.abs(deltaY) < DRAG_DEAD_ZONE_PX) return;
    // Горизонтальное движение — это листание, его обрабатывает Swiper.
    if (!dragActive.current && Math.abs(deltaX) > Math.abs(deltaY)) return;
    dragActive.current = true;
    setOffsetY(deltaY);
  }, [dragEnabled]);

  const handleTouchEnd = useCallback(() => {
    if (!dragActive.current) {
      setOffsetY(0);
      return;
    }
    dragActive.current = false;
    const distance = Math.abs(offsetY);
    const velocity = distance / Math.max(1, Date.now() - startedAt.current);
    if (distance > CLOSE_DISTANCE_PX || velocity > CLOSE_VELOCITY) {
      onClose();
      return;
    }
    setOffsetY(0);
  }, [offsetY, onClose]);

  const chromeOpacity = 1 - Math.min(Math.abs(offsetY) / FADE_DISTANCE_PX, 1);
  const layerScale = 1 - Math.min(Math.abs(offsetY) / SCALE_DISTANCE_PX, MAX_SCALE_DOWN);
  const isSettled = offsetY === 0;

  return (
    // 100dvh, а не vh: иначе адресная строка мобильного браузера съедает низ галереи.
    <div className='fixed inset-0 z-[1000] flex h-[100dvh] w-full touch-none flex-col overflow-hidden bg-white'>
      <div
        className='z-10 flex shrink-0 items-center justify-between px-4 py-5'
        style={{opacity: chromeOpacity, transition: isSettled ? 'opacity 0.25s ease' : 'none'}}
      >
        <span className='w-10'/>
        <span className='flex-1 text-center text-[15px] font-semibold uppercase text-neutral-900'>
          <span className='text-purple-600'>{activeIndex + 1}</span> из {images.length}
        </span>
        <button
          type='button'
          onClick={onClose}
          aria-label='Закрыть просмотр фотографий'
          className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition-colors active:bg-purple-100'
        >
          <CrossIcon/>
        </button>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className='relative z-50 flex min-h-0 w-full flex-1 items-center justify-center will-change-transform'
        style={{
          transform: `translate3d(0, ${offsetY}px, 0) scale(${layerScale})`,
          transition: isSettled ? 'transform 0.25s ease' : 'none'
        }}
      >
        <Swiper
          modules={[Zoom]}
          zoom={{maxRatio: ZOOM_MAX_RATIO, minRatio: 1}}
          slidesPerView={1}
          loop={images.length > 1}
          initialSlide={initialSlide}
          onSwiper={swiper => {
            swiperRef.current = swiper;
            onSwiper(swiper);
          }}
          onSlideChange={swiper => onIndexChange(swiper.realIndex)}
          onZoomChange={(_swiper, scale) => setIsZoomed(scale > 1)}
          className='h-full w-full'
        >
          {images.map((image, index) => (
            <SwiperSlide key={`${image.src}-${index}`} className='flex items-center justify-center'>
              {/* swiper-zoom-container — служебный класс модуля Zoom, по нему он находит цель пинча. */}
              <div className='swiper-zoom-container flex h-full w-full items-center justify-center'>
                <img
                  src={loadImage(image.src, FULL_WIDTH)}
                  alt={image.alt}
                  draggable={false}
                  className='block max-h-full max-w-full object-contain'
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {images.length > 1 && (
        <div
          className='z-10 shrink-0 px-4 pt-3 pb-[env(safe-area-inset-bottom,20px)]'
          style={{opacity: chromeOpacity, transition: isSettled ? 'opacity 0.25s ease' : 'none'}}
        >
          <div className='flex gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {images.map((image, index) => (
              <button
                type='button'
                key={`${image.src}-${index}`}
                aria-label={`Фото ${index + 1}`}
                onClick={() => {
                  if (!isSettled) return;
                  onIndexChange(index);
                  swiperRef.current?.slideToLoop(index);
                }}
                className={`h-16 w-16 shrink-0 rounded transition ${
                  index === activeIndex ? 'opacity-100 ring-2 ring-inset ring-purple-600' : 'opacity-50'
                }`}
              >
                <img
                  src={loadImage(image.src, THUMB_WIDTH)}
                  alt=''
                  loading='lazy'
                  draggable={false}
                  className='h-full w-full rounded bg-neutral-100 object-cover'
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CrossIcon() {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='M6 6L18 18M18 6L6 18' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
    </svg>
  );
}
