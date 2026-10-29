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

    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [offset, tolerance]);

  return hidden;
}
