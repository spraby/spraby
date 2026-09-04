'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import type {Swiper as SwiperClass} from 'swiper';
import {FreeMode} from 'swiper/modules';
import {NormalizedImage, PhotoViewerImageLoader} from './types';

type Props = {
  images: NormalizedImage[]
  activeIndex: number
  onIndexChange: (index: number) => void
  onClose: () => void
  loadImage: PhotoViewerImageLoader
  onSwiper: (swiper: SwiperClass) => void
};

/** Во сколько раз увеличивается фото по клику. */
const ZOOM_SCALE = 2.5;
const THUMB_WIDTH = 96;
const FULL_WIDTH = 2000;
/** Сторона квадратного превью и зазор между ними, px. */
const THUMB_SIZE = 66;
const THUMB_GAP = 12;
/** Сколько превью помещается в колонку; дальше появляются стрелки. */
const VISIBLE_THUMBS = 5;
const THUMBS_VIEWPORT_HEIGHT = VISIBLE_THUMBS * THUMB_SIZE + (VISIBLE_THUMBS - 1) * THUMB_GAP;

export default function DesktopViewer({images, activeIndex, onIndexChange, onClose, loadImage, onSwiper}: Props) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [zoomedSrc, setZoomedSrc] = useState<string | null>(null);
  const [origin, setOrigin] = useState({x: 50, y: 50});
  const [thumbsEdges, setThumbsEdges] = useState({start: true, end: false});
  const mainSwiperRef = useRef<SwiperClass | null>(null);
  /**
   * initialSlide читается Swiper'ом только при инициализации. Если передавать
   * туда живой activeIndex, каждое обновление пропа откатывает слайдер назад
   * и ломает бесконечную прокрутку — поэтому фиксируем значение на монтировании.
   */
  const initialSlide = useRef(activeIndex).current;

  // Смена слайда всегда сбрасывает зум: иначе следующее фото открывается уже увеличенным.
  useEffect(() => {
    setZoomedSrc(null);
  }, [activeIndex]);

  // Лента превью подкручивается к активному кадру, когда его меняют
  // стрелками, колесом или клавиатурой.
  useEffect(() => {
    thumbsSwiper?.slideTo(activeIndex);
  }, [activeIndex, thumbsSwiper]);

  /**
   * Связываем слайдеры вручную вместо модуля Thumbs: он навешивает обработчик
   * клика на инициализации главного слайдера, а лента превью к этому моменту
   * ещё не смонтирована, и клики по миниатюрам не доходят.
   */
  const handleThumbClick = useCallback((index: number) => {
    // slideToLoop считает индекс в исходном порядке картинок; при выключенном
    // loop ведёт себя как обычный slideTo.
    mainSwiperRef.current?.slideToLoop(index);
    onIndexChange(index);
  }, [onIndexChange]);

  const readOrigin = useCallback((event: {clientX: number, clientY: number, currentTarget: HTMLElement}) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100
    };
  }, []);

  const handleImageClick = useCallback((event: React.MouseEvent<HTMLDivElement>, src: string) => {
    if (zoomedSrc === src) {
      setZoomedSrc(null);
      return;
    }
    setOrigin(readOrigin(event));
    setZoomedSrc(src);
  }, [readOrigin, zoomedSrc]);

  const handleImageMove = useCallback((event: React.MouseEvent<HTMLDivElement>, src: string) => {
    if (zoomedSrc !== src) return;
    setOrigin(readOrigin(event));
  }, [readOrigin, zoomedSrc]);

  // Стрелки колонки гасим на краях. Возвращаем прежний объект, если ничего
  // не изменилось, — onProgress во freeMode срабатывает на каждый кадр скролла.
  const syncThumbsEdges = useCallback((swiper: SwiperClass) => {
    setThumbsEdges(prev => (
      prev.start === swiper.isBeginning && prev.end === swiper.isEnd
        ? prev
        : {start: swiper.isBeginning, end: swiper.isEnd}
    ));
  }, []);

  const hasThumbs = images.length > 1;
  const hasThumbsNav = images.length > VISIBLE_THUMBS;

  return (
    <div className='flex h-full w-full items-center'>
      <button
        type='button'
        onClick={onClose}
        aria-label='Закрыть просмотр фотографий'
        className='absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition duration-200 hover:rotate-90 hover:scale-110 hover:bg-purple-100 hover:shadow-lg'
      >
        <CrossIcon/>
      </button>

      {hasThumbs && (
        <div className='flex h-full w-[110px] shrink-0 flex-col items-center justify-center gap-3 px-2 py-6'>
          {hasThumbsNav && (
            <ThumbNavButton
              direction='up'
              disabled={thumbsEdges.start}
              onClick={() => thumbsSwiper?.slidePrev()}
            />
          )}
          <Swiper
            onSwiper={swiper => {
              setThumbsSwiper(swiper);
              syncThumbsEdges(swiper);
            }}
            onProgress={syncThumbsEdges}
            onSlideChange={syncThumbsEdges}
            modules={[FreeMode]}
            direction='vertical'
            slidesPerView='auto'
            spaceBetween={THUMB_GAP}
            freeMode
            className='w-full min-h-0 flex-1'
            style={{maxHeight: THUMBS_VIEWPORT_HEIGHT}}
          >
            {images.map((image, index) => (
              <SwiperSlide key={`${image.src}-${index}`} className='!h-[66px] flex justify-center'>
                <img
                  src={loadImage(image.src, THUMB_WIDTH)}
                  alt={`Фото ${index + 1}`}
                  loading='lazy'
                  draggable={false}
                  onClick={() => handleThumbClick(index)}
                  className={`block h-[66px] w-[66px] shrink-0 cursor-pointer rounded bg-neutral-100 object-cover transition ${
                    index === activeIndex
                      ? 'opacity-100 ring-2 ring-inset ring-purple-600'
                      : 'opacity-50 hover:opacity-80 hover:ring-2 hover:ring-inset hover:ring-purple-200'
                  }`}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          {hasThumbsNav && (
            <ThumbNavButton
              direction='down'
              disabled={thumbsEdges.end}
              onClick={() => thumbsSwiper?.slideNext()}
            />
          )}
        </div>
      )}

      <div className='relative flex h-[90%] min-w-0 flex-1 items-center justify-center'>
        <Swiper
          initialSlide={initialSlide}
          slidesPerView={1}
          loop={hasThumbs}
          allowTouchMove={hasThumbs}
          onSwiper={swiper => {
            mainSwiperRef.current = swiper;
            onSwiper(swiper);
          }}
          onSlideChange={swiper => onIndexChange(swiper.realIndex)}
          className='h-full w-full'
        >
          {images.map((image, index) => {
            const isZoomed = zoomedSrc === image.src;
            return (
              <SwiperSlide key={`${image.src}-${index}`}>
                {/*
                  Внешний слой держит отступы под стрелки и сам не кликабелен:
                  иначе клик мимо кнопки проваливался бы сюда и включал зум.
                */}
                <div className='flex h-full w-full items-center justify-center'>
                  {/*
                    Зона фото уже колонки: 80% по ширине и 95% по высоте.
                    max-w страхует узкие экраны, где 10% с каждой стороны
                    оказались бы меньше кнопки-стрелки (w-20 = 80px).
                  */}
                  <div
                    onClick={event => handleImageClick(event, image.src)}
                    onMouseMove={event => handleImageMove(event, image.src)}
                    onMouseLeave={() => isZoomed && setZoomedSrc(null)}
                    className={`flex h-[95%] w-4/5 items-center justify-center overflow-hidden ${
                      hasThumbs ? 'max-w-[calc(100%-180px)]' : ''
                    } ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                  >
                    <img
                      src={loadImage(image.src, FULL_WIDTH)}
                      alt={image.alt}
                      draggable={false}
                      className='pointer-events-none block h-full w-full select-none object-contain transition-transform duration-150 ease-out will-change-transform'
                      style={{
                        transformOrigin: isZoomed ? `${origin.x}% ${origin.y}%` : '50% 50%',
                        transform: isZoomed ? `scale(${ZOOM_SCALE})` : 'scale(1)'
                      }}
                    />
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/*
          Своя навигация вместо модуля Navigation: он рисует стрелку собственным
          svg, который иначе пришлось бы переопределять глобальными стилями.
          Лента бесконечная, поэтому крайних состояний у кнопок нет.
        */}
        {hasThumbs && (
          <>
            <NavButton side='prev' onClick={() => mainSwiperRef.current?.slidePrev()}/>
            <NavButton side='next' onClick={() => mainSwiperRef.current?.slideNext()}/>
          </>
        )}
      </div>
    </div>
  );
}

function NavButton({side, onClick}: {side: 'prev' | 'next', onClick: () => void}) {
  const isPrev = side === 'prev';
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={isPrev ? 'Предыдущее фото' : 'Следующее фото'}
      className={`group absolute top-0 z-10 flex h-full w-20 items-center justify-center ${
        isPrev ? 'left-0' : 'right-0'
      }`}
    >
      <span className='flex h-11 w-11 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition duration-200 group-hover:scale-110 group-hover:bg-purple-100'>
        <ChevronIcon flipped={!isPrev}/>
      </span>
    </button>
  );
}

function ThumbNavButton({direction, disabled, onClick}: {direction: 'up' | 'down', disabled: boolean, onClick: () => void}) {
  const isUp = direction === 'up';
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={isUp ? 'Предыдущие превью' : 'Следующие превью'}
      className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition hover:bg-purple-100 disabled:opacity-30 disabled:hover:bg-purple-50'
    >
      <span className={isUp ? 'rotate-90' : '-rotate-90'}>
        <ChevronIcon small/>
      </span>
    </button>
  );
}

function ChevronIcon({flipped, small}: {flipped?: boolean, small?: boolean}) {
  return (
    <svg
      width={small ? 8 : 14}
      height={small ? 15 : 26}
      viewBox='0 0 14 26'
      fill='none'
      aria-hidden='true'
      className={flipped ? 'rotate-180' : ''}
    >
      <path d='M12 1L2 13L12 25' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='M6 6L18 18M18 6L6 18' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
    </svg>
  );
}
