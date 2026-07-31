'use client';

import {useState} from 'react';
import {FiArrowLeft, FiArrowRight, FiBarChart2, FiGrid, FiShoppingBag} from 'react-icons/fi';

import SellerChartSlide from './SellerChartSlide';
import SellerOverviewSlide from './SellerOverviewSlide';
import SellerProductsSlide from './SellerProductsSlide';
import {DASHBOARD_PERIODS} from './showcase-data';
import type {PeriodKey} from './showcase-data';

const SLIDES = [
  {
    title: 'Сводка',
    description: 'Главные показатели и заказы, которым нужно внимание.',
    icon: FiGrid,
  },
  {
    title: 'Динамика',
    description: 'Продажи и интерес покупателей в понятном графике.',
    icon: FiBarChart2,
  },
  {
    title: 'Товары',
    description: 'Лидеры по продажам и конверсии без ручных расчётов.',
    icon: FiShoppingBag,
  },
] as const;

const PERIODS: PeriodKey[] = [7, 30, 90];

export default function SellerAdminShowcase() {
  const [slide, setSlide] = useState(0);
  const [period, setPeriod] = useState<PeriodKey>(30);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const dashboard = DASHBOARD_PERIODS[period];

  const goToSlide = (nextSlide: number) => {
    const total = SLIDES.length;
    setSlide((nextSlide + total) % total);
  };

  return (
    <section id="seller-cabinet" className="scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600">Личный кабинет продавца</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
            Понимайте, что происходит с продажами
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Три раздела с метриками показывают путь от интереса к заказу
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50/70 shadow-[0_30px_80px_-54px_rgba(15,23,42,0.5)] sm:mt-10">
          <div className="border-b border-slate-200 bg-white p-3 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 sm:text-base">Панель управления</p>
                  <span className="rounded-full bg-purple-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-purple-700 sm:text-[10px]">
                    Демо
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                  Тестовые данные · Последние {period} дней · {dashboard.dateLabel}
                </p>
              </div>

              <div className="inline-flex self-start rounded-xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Период статистики">
                {PERIODS.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPeriod(item)}
                    aria-pressed={period === item}
                    className={`min-h-8 rounded-lg px-2.5 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
                      period === item ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {item} дней
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-1.5" role="tablist" aria-label="Возможности панели продавца">
              {SLIDES.map((item, index) => {
                const Icon = item.icon;
                const active = slide === index;

                return (
                  <button
                    key={item.title}
                    type="button"
                    role="tab"
                    id={`seller-showcase-tab-${index}`}
                    aria-controls={`seller-showcase-panel-${index}`}
                    aria-selected={active}
                    onClick={() => goToSlide(index)}
                    className={`min-w-0 rounded-xl border px-2 py-2.5 text-left transition sm:flex sm:items-center sm:gap-3 sm:px-3 ${
                      active
                        ? 'border-purple-200 bg-purple-50 text-purple-800'
                        : 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span className={`mx-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:mx-0 sm:h-8 sm:w-8 ${
                      active ? 'bg-white text-purple-600 shadow-sm' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4"/>
                    </span>
                    <span className="mt-1.5 block min-w-0 text-center sm:mt-0 sm:text-left">
                      <strong className="block truncate text-[11px] font-semibold sm:text-xs">{item.title}</strong>
                      <span className="mt-0.5 hidden text-[10px] leading-4 text-slate-500 lg:block">{item.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id={`seller-showcase-panel-${slide}`}
            role="tabpanel"
            aria-labelledby={`seller-showcase-tab-${slide}`}
            className="p-2.5 sm:p-4 lg:p-5"
          >
            {slide === 0 ? (
              <SellerOverviewSlide
                data={dashboard}
                detailsOpen={detailsOpen}
                onToggleDetails={() => setDetailsOpen(value => !value)}
              />
            ) : null}
            {slide === 1 ? <SellerChartSlide data={dashboard.chart}/> : null}
            {slide === 2 ? <SellerProductsSlide period={period}/> : null}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-3 sm:px-5">
            <p className="text-[10px] text-slate-500 sm:text-xs">
              {slide + 1} / {SLIDES.length} · {SLIDES[slide].title}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goToSlide(slide - 1)}
                aria-label="Предыдущий экран"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-purple-200 hover:text-purple-700"
              >
                <FiArrowLeft aria-hidden="true"/>
              </button>
              <button
                type="button"
                onClick={() => goToSlide(slide + 1)}
                aria-label="Следующий экран"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-purple-600 px-3.5 text-xs font-semibold text-white transition hover:bg-purple-700"
              >
                Далее
                <FiArrowRight aria-hidden="true"/>
              </button>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-4 max-w-2xl text-center text-[11px] leading-5 text-slate-400 sm:text-xs">
          Это схематическая демонстрация интерфейса. Реальные показатели формируются из данных вашего магазина.
        </p>
      </div>
    </section>
  );
}
