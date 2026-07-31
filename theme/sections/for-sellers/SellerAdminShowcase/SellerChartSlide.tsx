import {useEffect, useMemo, useState} from 'react';

import type {ChartPoint} from './showcase-data';
import {formatMoney, formatNumber} from './showcase-data';

type ChartMode = 'sales' | 'interest';

type SellerChartSlideProps = {
  data: ChartPoint[];
};

const WIDTH = 760;
const HEIGHT = 260;
const PADDING = {top: 20, right: 20, bottom: 38, left: 48};

export default function SellerChartSlide({data}: SellerChartSlideProps) {
  const [mode, setMode] = useState<ChartMode>('sales');
  const [activePoint, setActivePoint] = useState(data.length - 1);

  const chart = useMemo(() => buildChart(
    data.map(point => mode === 'sales' ? point.revenue : point.views),
    data.map(point => mode === 'sales' ? point.orders : point.cart),
  ), [data, mode]);
  const selected = data[Math.min(activePoint, data.length - 1)];

  useEffect(() => {
    setActivePoint(data.length - 1);
  }, [data]);

  const changeMode = (nextMode: ChartMode) => {
    setMode(nextMode);
    setActivePoint(data.length - 1);
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
            {mode === 'sales' ? 'Продажи по дням' : 'Интерес к товарам'}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            {mode === 'sales'
              ? 'Выручка и количество заказов'
              : 'Просмотры и добавления в корзину'}
          </p>
        </div>
        <div className="inline-flex self-start rounded-xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Данные графика">
          <ModeButton active={mode === 'sales'} onClick={() => changeMode('sales')}>Продажи</ModeButton>
          <ModeButton active={mode === 'interest'} onClick={() => changeMode('interest')}>Интерес</ModeButton>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
        <MobileValue
          label={mode === 'sales' ? 'Выручка' : 'Просмотры'}
          value={mode === 'sales' ? formatMoney(selected.revenue) : formatNumber(selected.views)}
          color="bg-purple-500"
        />
        <MobileValue
          label={mode === 'sales' ? 'Заказы' : 'В корзину'}
          value={formatNumber(mode === 'sales' ? selected.orders : selected.cart)}
          color="bg-orange-500"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-slate-50/70 px-1 pt-2 sm:mt-6 sm:px-3">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto min-h-[190px] w-full"
          role="img"
          aria-label={mode === 'sales' ? 'График выручки и заказов' : 'График просмотров и добавлений в корзину'}
        >
          <defs>
            <linearGradient id="seller-showcase-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28"/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map(index => {
            const y = PADDING.top + ((HEIGHT - PADDING.top - PADDING.bottom) / 4) * index;
            const labelValue = Math.round(chart.primaryMax * (1 - index / 4));

            return (
              <g key={index}>
                <line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1"/>
                <text x={PADDING.left - 9} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">
                  {compactNumber(labelValue)}
                </text>
              </g>
            );
          })}

          <path d={chart.areaPath} fill="url(#seller-showcase-area)"/>
          <path d={chart.primaryPath} fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d={chart.secondaryPath} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>

          {chart.primaryPoints.map((point, index) => (
            <g key={data[index].label}>
              <rect
                x={point.x - 22}
                y={PADDING.top}
                width="44"
                height={HEIGHT - PADDING.top - PADDING.bottom}
                fill="transparent"
                role="button"
                tabIndex={0}
                aria-label={`Показать данные за ${data[index].label}`}
                onClick={() => setActivePoint(index)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActivePoint(index);
                  }
                }}
              />
              {activePoint === index ? (
                <>
                  <line x1={point.x} x2={point.x} y1={PADDING.top} y2={HEIGHT - PADDING.bottom} stroke="#c4b5fd" strokeDasharray="4 4"/>
                  <circle cx={point.x} cy={point.y} r="6" fill="#fff" stroke="#7c3aed" strokeWidth="3"/>
                </>
              ) : null}
              <text
                x={point.x}
                y={HEIGHT - 14}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                className={index % 2 === 1 ? 'hidden sm:block' : undefined}
              >
                {data[index].label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-100 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <strong className="text-xs text-slate-700">{selected.label}</strong>
        <div className="hidden flex-wrap gap-x-5 gap-y-1 text-xs sm:flex">
          <LegendValue
            label={mode === 'sales' ? 'Выручка' : 'Просмотры'}
            value={mode === 'sales' ? formatMoney(selected.revenue) : formatNumber(selected.views)}
            color="bg-purple-500"
          />
          <LegendValue
            label={mode === 'sales' ? 'Заказы' : 'В корзину'}
            value={formatNumber(mode === 'sales' ? selected.orders : selected.cart)}
            color="bg-orange-500"
          />
        </div>
        <p className="text-[10px] text-slate-400 sm:text-xs">Нажмите на точку графика</p>
      </div>
    </article>
  );
}

function ModeButton({active, onClick, children}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-8 rounded-lg px-3 text-xs font-semibold transition ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

function MobileValue({label, value, color}: {label: string; value: string; color: string}) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
        <span className={`h-1.5 w-1.5 rounded-full ${color}`}/>{label}
      </span>
      <strong className="mt-1 block truncate text-sm text-slate-900">{value}</strong>
    </div>
  );
}

function LegendValue({label, value, color}: {label: string; value: string; color: string}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-500">
      <span className={`h-2 w-2 rounded-full ${color}`}/>
      {label} <strong className="text-slate-800">{value}</strong>
    </span>
  );
}

function buildChart(primary: number[], secondary: number[]) {
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const primaryMax = Math.max(...primary, 1) * 1.12;
  const secondaryMax = Math.max(...secondary, 1) * 1.12;
  const denominator = Math.max(primary.length - 1, 1);
  const toPoints = (values: number[], max: number) => values.map((value, index) => ({
    x: PADDING.left + (plotWidth / denominator) * index,
    y: PADDING.top + plotHeight - (value / max) * plotHeight,
  }));
  const primaryPoints = toPoints(primary, primaryMax);
  const secondaryPoints = toPoints(secondary, secondaryMax);
  const toPath = (points: {x: number; y: number}[]) => points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
  const primaryPath = toPath(primaryPoints);
  const secondaryPath = toPath(secondaryPoints);
  const baseline = HEIGHT - PADDING.bottom;
  const areaPath = `${primaryPath} L ${primaryPoints.at(-1)?.x ?? PADDING.left} ${baseline} L ${primaryPoints[0]?.x ?? PADDING.left} ${baseline} Z`;

  return {primaryMax, primaryPoints, primaryPath, secondaryPath, areaPath};
}

function compactNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }

  return String(value);
}
