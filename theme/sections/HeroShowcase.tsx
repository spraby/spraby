'use client';

import {useMemo, useState, useCallback} from 'react';
import Link from 'next/link';

type HeroCard = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
  expiresAtLabel?: string;
  image?: {
    src?: string;
    alt?: string;
  };
};

type Props = {
  cards: HeroCard[];
  initialIndex?: number;
};

const PLACEHOLDER_PATTERN = (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[0.375rem] bg-[#ebe9fb]">
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10" />
    <span className="relative text-xs font-semibold uppercase tracking-[0.45em] text-gray-400">
      изображение
    </span>
  </div>
);

export default function HeroShowcase({cards, initialIndex = 0}: Props) {
  const [activeIndex, setActiveIndex] = useState(() => clampIndex(cards, initialIndex));
  const activeCard = cards[activeIndex];
  const total = cards.length;

  const tabs = useMemo(() => cards.map((card) => ({
    id: card.id,
    title: card.title,
    subtitle: card.subtitle,
  })), [cards]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  if (!cards.length) return null;

  return (
    <section className="relative">
      <div className="relative mt-5 overflow-hidden rounded-[0.375rem] bg-[#f2f1ff] px-5 pt-10 pb-0 sm:px-6 sm:pb-10 md:mt-6 md:px-16 md:py-16 md:min-h-[520px] lg:min-h-[560px]">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-br from-[#f0efff] via-[#edeafb] to-[#f6f4ff] md:block" />

        <div className="relative grid gap-8 sm:gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:min-h-[360px] lg:min-h-[400px]">
          <div className="flex h-full min-h-[200px] sm:min-h-[220px] md:min-h-[260px] flex-col justify-between gap-6 sm:gap-8 md:gap-10">
            <div className="flex flex-col gap-4">
              {activeCard.eyebrow && (
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-500/80 md:text-sm">
                  {activeCard.eyebrow}
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 md:text-5xl">{activeCard.title}</h1>
              <p className="text-lg font-semibold text-purple-600 md:text-2xl">
                {activeCard.subtitle}
              </p>
              {activeCard.description && (
                <p className="max-w-xl text-sm text-gray-500 md:text-base">
                  {activeCard.description}
                </p>
              )}
              {activeCard.expiresAtLabel && (
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400 md:text-sm">
                  {activeCard.expiresAtLabel}
                </p>
              )}
            </div>

            {activeCard.cta && (
              <Link
                href={activeCard.cta.href}
                className="inline-flex w-max items-center justify-center rounded-[0.375rem] bg-[#7c3aed] px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_-20px_rgba(124,58,237,0.9)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#6d31da]"
              >
                {activeCard.cta.label}
              </Link>
            )}
          </div>

          <div className="flex w-full md:h-full md:items-center md:justify-center">
            <div
              className="relative h-full w-[calc(100%+2.5rem)] -ml-5 -mr-5 sm:w-full sm:ml-0 sm:mr-0 max-w-none min-h-[200px] sm:min-h-[240px] md:max-w-[620px] md:min-h-[260px] aspect-[16/9] overflow-hidden rounded-none sm:rounded-[0.375rem] shadow-[0_25px_45px_-35px_rgba(118,67,212,0.5)]"
            >
              {activeCard.image?.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeCard.image.src}
                  alt={activeCard.image?.alt ?? activeCard.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                PLACEHOLDER_PATTERN
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none -mt-10 flex justify-center pt-5 md:-mt-12 md:pt-6">
        <div
          className="pointer-events-auto w-full max-w-4xl overflow-hidden rounded-[0.375rem] bg-white shadow-[0_55px_75px_-40px_rgba(118,67,212,0.45)]"
        >
          <div className="hidden md:grid md:grid-cols-4 md:gap-0 md:overflow-hidden md:px-0 md:pb-0">
            {tabs.map((tab, index) => {
              const isActive = index === activeIndex;
              const isFirst = index === 0;
              const isLast = index === tabs.length - 1;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={classNames(
                    'relative flex h-full min-w-[220px] flex-col gap-1 px-5 py-4 text-left transition-all duration-300 ease-out sm:min-w-[240px] md:min-w-0 md:px-8 md:py-5',
                    isFirst && 'rounded-l-[0.375rem]',
                    isLast && 'rounded-r-[0.375rem]',
                    !isFirst && 'md:border-l md:border-gray-200/70',
                    isActive
                      ? 'bg-white text-gray-900 shadow-[0_24px_45px_-40px_rgba(118,67,212,0.7)]'
                      : 'bg-[#f7f7fb] text-gray-500 hover:bg-white'
                  )}
                >
                  <span className={classNames('text-sm font-semibold', isActive ? 'text-gray-900' : 'text-gray-600')}>
                    {tab.title}
                  </span>
                  <span className={classNames('text-xs', isActive ? 'text-purple-500' : 'text-gray-400')}>
                    {tab.subtitle}
                  </span>
                  <span
                    className={classNames(
                      'pointer-events-none absolute left-0 top-0 h-1.5 w-full transition-all duration-300',
                      isActive ? 'bg-[#7c3aed] opacity-100' : 'opacity-0'
                    )}
                  />
                </button>
              );
            })}
          </div>
          {/* Mobile pagination controls */}
          <div className="flex items-center justify-between px-4 pb-3 pt-8 md:hidden">
            <button
              type="button"
              onClick={handlePrev}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
              aria-label="Предыдущий баннер"
            >
              ‹
            </button>
            <div className="flex items-center gap-2">
              {tabs.map((_, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={`dot-${idx}`}
                    type="button"
                    aria-label={`Перейти к баннеру ${idx + 1}`}
                    onClick={() => setActiveIndex(idx)}
                    className={classNames(
                      'h-2.5 rounded-full transition-all duration-200',
                      isActive ? 'w-6 bg-[#7c3aed]' : 'w-2 bg-gray-300'
                    )}
                  />
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
              aria-label="Следующий баннер"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function clampIndex(cards: HeroCard[], index: number) {
  if (index < 0) return 0;
  if (index >= cards.length) return cards.length - 1;
  return index;
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type {HeroCard};
