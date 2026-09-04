'use client';

import {useEffect} from 'react';

type Options = {
  enabled: boolean
  totalSlides: number
  onClose: () => void
  onStep: (delta: number) => void
  /** На мобильном колесо не нужно, а перехват wheel мешает пинчу. */
  enableWheel?: boolean
};

/** Колесо листает не быстрее одного слайда за этот интервал. */
const WHEEL_THROTTLE_MS = 400;

/**
 * Клавиатура, колесо и блокировка скролла body — всё, что просмотрщик
 * вешает на window, пока открыт.
 */
export function useViewerControls({enabled, totalSlides, onClose, onStep, enableWheel = true}: Options) {
  useEffect(() => {
    if (!enabled) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        onStep(1);
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        onStep(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onClose, onStep]);

  useEffect(() => {
    if (!enabled || !enableWheel || totalSlides < 2) return;
    let lastStepAt = 0;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const now = Date.now();
      if (now - lastStepAt < WHEEL_THROTTLE_MS) return;
      lastStepAt = now;
      onStep(event.deltaY > 0 ? 1 : -1);
    };
    window.addEventListener('wheel', handleWheel, {passive: false});
    return () => window.removeEventListener('wheel', handleWheel);
  }, [enabled, enableWheel, onStep, totalSlides]);
}
