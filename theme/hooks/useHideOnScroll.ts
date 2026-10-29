'use client'

import {useEffect, useState} from "react";

/**
 * true, когда шапку нужно спрятать: листаем вниз дальше `offset`.
 * При прокрутке вверх или у самого верха страницы — false.
 * `tolerance` гасит дрожание при скрытии; показываем сразу при движении вверх.
 */
export function useHideOnScroll(offset = 80, tolerance = 8) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = Math.max(0, window.scrollY);
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;

      if (y <= offset) {
        setHidden(false);
        lastY = y;
        return;
      }

      // Показываем при любом движении вверх, прячем — только после tolerance
      if (delta < 0) {
        setHidden(false);
        lastY = y;
        return;
      }

      if (delta < tolerance) return;

      setHidden(true);
      lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Мобильные браузеры тратят начало жеста вверх на показ своей адресной
    // строки: страница не прокручивается и scroll не приходит. Поэтому
    // короткий свайп вниз пальцем ловим по самому касанию.
    let touchY = 0;

    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0].clientY;
      if (currentY - touchY > tolerance) {
        setHidden(false);
        lastY = Math.max(0, window.scrollY);
      }
      if (currentY < touchY) touchY = currentY;
    };

    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('touchstart', onTouchStart, {passive: true});
    window.addEventListener('touchmove', onTouchMove, {passive: true});
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [offset, tolerance]);

  return hidden;
}
