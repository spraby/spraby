'use client'

import {useEffect} from "react";

const LOCK_COUNT_ATTR = 'data-scroll-lock-count';
const LOCK_OVERFLOW_ATTR = 'data-scroll-lock-overflow';

/**
 * Locks body scroll whenever `active` is true. Supports nested locks.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (typeof document === 'undefined' || !active) return;

    const body = document.body;
    const currentCount = Number(body.getAttribute(LOCK_COUNT_ATTR) ?? '0');

    if (currentCount === 0) {
      body.setAttribute(LOCK_OVERFLOW_ATTR, body.style.overflow || '');
      body.style.overflow = 'hidden';
    }
    body.setAttribute(LOCK_COUNT_ATTR, String(currentCount + 1));

    return () => {
      const storedCount = Number(body.getAttribute(LOCK_COUNT_ATTR) ?? '0');
      const nextCount = Math.max(0, storedCount - 1);

      if (nextCount === 0) {
        const originalOverflow = body.getAttribute(LOCK_OVERFLOW_ATTR) ?? '';
        body.style.overflow = originalOverflow;
        body.removeAttribute(LOCK_OVERFLOW_ATTR);
        body.removeAttribute(LOCK_COUNT_ATTR);
      } else {
        body.setAttribute(LOCK_COUNT_ATTR, String(nextCount));
      }
    };
  }, [active]);
}
