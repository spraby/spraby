'use client';

import {useMemo, useState} from 'react';
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
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[32px] bg-[#ebe9fb]">
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10" />
    <span className="relative text-xs font-semibold uppercase tracking-[0.45em] text-gray-400">
      изображение
    </span>
  </div>
);

export default function HeroShowcase({cards, initialIndex = 0}: Props) {
  const [activeIndex, setActiveIndex] = useState(() => clampIndex(cards, initialIndex));
  const activeCard = cards[activeIndex];

  const tabs = useMemo(() => cards.map((card) => ({
    id: card.id,
    title: card.title,
    subtitle: card.subtitle,
  })), [cards]);

  if (!cards.length) return null;

  return (
    <section className="relative">
      <div className="relative mt-5 overflow-hidden rounded-[40px] bg-[#f2f1ff] px-5 py-10 shadow-[0_48px_80px_-60px_rgba(118,67,212,0.55)] sm:px-6 md:mt-6 md:px-16 md:py-16">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-br from-[#f0efff] via-[#edeafb] to-[#f6f4ff] md:block" />

        <div className="relative grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-12">
          <div className="flex flex-col justify-between gap-8 sm:gap-10">
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
                className="inline-flex w-max items-center justify-center rounded-full bg-[#7c3aed] px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_-20px_rgba(124,58,237,0.9)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#6d31da]"
              >
                {activeCard.cta.label}
              </Link>
            )}
          </div>

          <div className="hidden min-h-[260px] md:flex md:items-center md:justify-center">
            {activeCard.image?.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeCard.image.src}
                alt={activeCard.image?.alt ?? activeCard.title}
                className="h-full w-full rounded-[32px] object-cover shadow-[0_25px_45px_-35px_rgba(118,67,212,0.5)]"
              />
            ) : (
              PLACEHOLDER_PATTERN
            )}
          </div>
        </div>
      </div>

      <div className="pointer-events-none -mt-10 flex justify-center pt-5 md:-mt-12 md:pt-6">
        <div
          className="pointer-events-auto w-full max-w-4xl overflow-hidden rounded-[26px] bg-white shadow-[0_45px_60px_-45px_rgba(118,67,212,0.4)]"
        >
          <div
            className={classNames(
              'flex overflow-x-auto px-4 pb-3 gap-0',
              'md:grid md:grid-cols-4 md:gap-0 md:overflow-hidden md:px-0 md:pb-0'
            )}
          >
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
                  isFirst && 'rounded-l-[22px]',
                  isLast && 'rounded-r-[22px]',
                  index > 0 && 'md:border-l md:border-gray-200/70',
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
