'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import type {Swiper as SwiperClass} from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/zoom';

import DesktopViewer from './DesktopViewer';
import MobileViewer from './MobileViewer';
import {useViewerControls} from './useViewerControls';
import {NormalizedImage, PhotoViewerImage, PhotoViewerProps} from './types';

/** Ниже этой ширины показываем мобильный просмотрщик с пинч-зумом. */
const MOBILE_BREAKPOINT = 770;

const identityLoader = (src: string) => src;

/**
 * Полноэкранный просмотрщик фотографий.
 *
 * Единственная зависимость — swiper. Компонент не знает про модели витрины,
 * next/image и роутер: получает массив картинок и рендерит их.
 *
 * Десктоп: колонка превью + зум по клику с панорамированием за курсором.
 * Мобильный: пинч-зум (Swiper Zoom) и свайп вниз для закрытия.
 */
export default function PhotoViewer({
  images,
  open,
  initialIndex = 0,
  onClose,
  onIndexChange,
  imageLoader = identityLoader
}: PhotoViewerProps) {
  const normalized = useMemo(() => normalizeImages(images), [images]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const swiperRef = useRef<SwiperClass | null>(null);

  useEffect(() => setMounted(true), []);

  // Раскладку выбираем по matchMedia, а не рендерим обе: так в DOM живёт
  // ровно один Swiper и нет лишних слушателей тача.
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [open]);

  // Каждое открытие начинается с той картинки, что показана на странице.
  useEffect(() => {
    if (open) setActiveIndex(clampIndex(initialIndex, normalized.length));
  }, [open, initialIndex, normalized.length]);

  const handleIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
    onIndexChange?.(index);
  }, [onIndexChange]);

  const handleStep = useCallback((delta: number) => {
    const total = normalized.length;
    if (total < 2) return;
    const next = (activeIndex + delta + total) % total;
    swiperRef.current?.slideToLoop(next);
    handleIndexChange(next);
  }, [activeIndex, handleIndexChange, normalized.length]);

  useViewerControls({
    enabled: open && normalized.length > 0,
    totalSlides: normalized.length,
    onClose,
    onStep: handleStep,
    enableWheel: !isMobile
  });

  if (!mounted || !open || !normalized.length) return null;

  const viewer = (
    <div
      className='fixed inset-0 z-[1000] flex overflow-hidden bg-white'
      role='dialog'
      aria-modal='true'
      aria-label='Просмотр фотографий товара'
      onClick={onClose}
    >
      <div className='relative flex h-screen w-full flex-col' onClick={event => event.stopPropagation()}>
        {isMobile ? (
          <MobileViewer
            images={normalized}
            activeIndex={activeIndex}
            onIndexChange={handleIndexChange}
            onClose={onClose}
            loadImage={imageLoader}
            onSwiper={swiper => (swiperRef.current = swiper)}
          />
        ) : (
          <DesktopViewer
            images={normalized}
            activeIndex={activeIndex}
            onIndexChange={handleIndexChange}
            onClose={onClose}
            loadImage={imageLoader}
            onSwiper={swiper => (swiperRef.current = swiper)}
          />
        )}
      </div>
    </div>
  );

  return createPortal(viewer, document.body);
}

function normalizeImages(images: PhotoViewerImage[]): NormalizedImage[] {
  if (!Array.isArray(images)) return [];
  return images
    .map(image => (typeof image === 'string' ? {src: image} : image))
    .filter((image): image is Exclude<PhotoViewerImage, string> => Boolean(image?.src))
    .map(image => ({
      src: image.src,
      alt: image.alt ?? '',
      width: image.width,
      height: image.height
    }));
}

function clampIndex(index: number, total: number) {
  if (!Number.isFinite(index) || total === 0) return 0;
  return Math.min(Math.max(0, Math.trunc(index)), total - 1);
}
