'use client'

import {RefObject, useEffect, useState} from "react";

export function useRevealOnScrollUp(ref: RefObject<HTMLElement | null>, tolerance = 6) {
  const [revealed, setRevealed] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(() => setHeight(element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    let lastY = Math.max(0, window.scrollY);
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;

      if (y === 0) {
        setRevealed(false);
        lastY = y;
        return;
      }

      if (delta < 0) {
        setRevealed(true);
        lastY = y;
        return;
      }

      if (delta < tolerance) return;

      setRevealed(false);
      lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    let touchY = 0;

    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0].clientY;
      if (currentY - touchY > tolerance && window.scrollY > 0) {
        setRevealed(true);
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
  }, [tolerance]);

  return revealed ? 0 : -height;
}
