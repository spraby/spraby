import {useEffect, useMemo, useState} from 'react';

import type {ChartPoint} from './showcase-data';
import {formatMoney, formatNumber} from './showcase-data';

type ChartMode = 'sales' | 'interest';

type SellerChartSlideProps = {
  data: ChartPoint[];
};

const WIDTH = 760;
const HEIGHT = 260;
const PADDING = {top: 20, right: 48, bottom: 38, left: 48};
const COLORS = {
  revenue: '#7c3aed',
  views: '#2563eb',
  clicks: '#f59e0b',
  cart: '#10b981',
};

export default function SellerChartSlide({data}: SellerChartSlideProps) {
  const [mode, setMode] = useState<ChartMode>('sales');
  const [activePoint, setActivePoint] = useState<number | null>(null);

  const chart = useMemo(() => buildChart(
    data.map(point => mode === 'sales' ? point.revenue : point.views),
    data.map(point => mode === 'sales' ? point.orders : point.clicks),
    mode === 'interest' ? data.map(point => point.cart) : null,
    mode === 'sales',
  ), [data, mode]);
  const selected = data[activePoint ?? data.length - 1];
  const primaryColor = mode === 'sales' ? COLORS.revenue : COLORS.views;

  useEffect(() => {
    setActivePoint(null);
  }, [data]);

  const changeMode = (nextMode: ChartMode) => {
    setMode(nextMode);
    setActivePoint(null);
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
              : 'Просмотры, клики и добавления в корзину'}
          </p>
        </div>
        <div className="inline-flex self-start rounded-xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Данные графика">
          <ModeButton active={mode === 'sales'} onClick={() => changeMode('sales')}>Продажи</ModeButton>
          <ModeButton active={mode === 'interest'} onClick={() => changeMode('interest')}>Интерес</ModeButton>
        </div>
      </div>

      <div className={`mt-4 grid gap-2 sm:hidden ${mode === 'sales' ? 'grid-cols-2' : 'grid-cols-3'}`}>
        <MobileValue
          label={mode === 'sales' ? 'Выручка' : 'Просмотры'}
          value={mode === 'sales' ? formatMoney(selected.revenue) : formatNumber(selected.views)}
          color={mode === 'sales' ? 'bg-purple-500' : 'bg-blue-600'}
        />
        <MobileValue
          label={mode === 'sales' ? 'Заказы' : 'Клики'}
          value={formatNumber(mode === 'sales' ? selected.orders : selected.clicks)}
          color="bg-orange-500"
        />
        {mode === 'interest' ? (
          <MobileValue label="В корзину" value={formatNumber(selected.cart)} color="bg-emerald-500"/>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-slate-50/70 px-1 pt-2 sm:mt-6 sm:px-3">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto min-h-[190px] w-full"
          role="img"
          aria-label={mode === 'sales' ? 'График выручки и заказов' : 'График просмотров, кликов и добавлений в корзину'}
          onPointerLeave={() => setActivePoint(null)}
        >
          <defs>
            <linearGradient id="seller-showcase-primary-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.24"/>
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.02"/>
            </linearGradient>
            <linearGradient id="seller-showcase-secondary-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.clicks} stopOpacity="0.16"/>
              <stop offset="100%" stopColor={COLORS.clicks} stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="seller-showcase-tertiary-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.cart} stopOpacity="0.16"/>
              <stop offset="100%" stopColor={COLORS.cart} stopOpacity="0"/>
            </linearGradient>
            <filter id="seller-showcase-tooltip-shadow" x="-25%" y="-25%" width="150%" height="170%">
              <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.12"/>
            </filter>
          </defs>

          {[0, 1, 2, 3, 4].map(index => {
            const y = PADDING.top + ((HEIGHT - PADDING.top - PADDING.bottom) / 4) * index;
            const labelValue = Math.round(chart.primaryMax * (1 - index / 4));
            const secondaryLabelValue = Math.round(chart.secondaryMax * (1 - index / 4));

            return (
              <g key={index}>
                <line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1"/>
                <text x={PADDING.left - 9} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">
                  {compactNumber(labelValue)}
                </text>
                {mode === 'sales' ? (
                  <text
                    x={WIDTH - PADDING.right + 9}
                    y={y + 4}
                    textAnchor="start"
                    fill="#94a3b8"
                    fontSize="10"
                    className="hidden sm:block"
                  >
                    {compactNumber(secondaryLabelValue)}
                  </text>
                ) : null}
              </g>
            );
          })}

          <path d={chart.primary.areaPath} fill="url(#seller-showcase-primary-area)"/>
          <path d={chart.secondary.areaPath} fill="url(#seller-showcase-secondary-area)"/>
          {chart.tertiary ? (
            <path d={chart.tertiary.areaPath} fill="url(#seller-showcase-tertiary-area)"/>
          ) : null}

          <path d={chart.primary.path} fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d={chart.secondary.path} fill="none" stroke={COLORS.clicks} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"/>
          {chart.tertiary ? (
            <path d={chart.tertiary.path} fill="none" stroke={COLORS.cart} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"/>
          ) : null}

          {chart.primary.points.map((point, index) => (
            <g key={data[index].label}>
              <rect
                x={point.x - chart.hitWidth / 2}
                y={PADDING.top}
                width={chart.hitWidth}
                height={HEIGHT - PADDING.top - PADDING.bottom}
                fill="transparent"
                className="cursor-pointer"
                aria-hidden="true"
                onPointerEnter={() => setActivePoint(index)}
              />
              {activePoint === index ? (
                <>
                  <line x1={point.x} x2={point.x} y1={PADDING.top} y2={HEIGHT - PADDING.bottom} stroke="#cbd5e1" strokeDasharray="4 4"/>
                  <circle cx={point.x} cy={chart.primary.points[index].y} r="5" fill="#fff" stroke={primaryColor} strokeWidth="2.5"/>
                  <circle cx={point.x} cy={chart.secondary.points[index].y} r="4" fill="#fff" stroke={COLORS.clicks} strokeWidth="2"/>
                  {chart.tertiary ? (
                    <circle cx={point.x} cy={chart.tertiary.points[index].y} r="4" fill="#fff" stroke={COLORS.cart} strokeWidth="2"/>
                  ) : null}
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

          {activePoint !== null ? (
            <ChartTooltip
              mode={mode}
              point={chart.primary.points[Math.min(activePoint, chart.primary.points.length - 1)]}
              data={selected}
            />
          ) : null}
        </svg>
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

type Point = {x: number; y: number};

function ChartTooltip({mode, point, data}: {mode: ChartMode; point: Point; data: ChartPoint}) {
  const width = mode === 'sales' ? 176 : 164;
  const height = mode === 'sales' ? 72 : 92;
  const x = Math.min(
    Math.max(point.x - width / 2, PADDING.left + 4),
    WIDTH - PADDING.right - width - 4,
  );
  const y = Math.min(
    Math.max(point.y - height - 12, PADDING.top + 4),
    HEIGHT - PADDING.bottom - height - 8,
  );
  const rows = mode === 'sales'
    ? [
        {label: 'Выручка', value: formatMoney(data.revenue), color: COLORS.revenue},
        {label: 'Заказы', value: formatNumber(data.orders), color: COLORS.clicks},
      ]
    : [
        {label: 'Просмотры', value: formatNumber(data.views), color: COLORS.views},
        {label: 'Клики', value: formatNumber(data.clicks), color: COLORS.clicks},
        {label: 'В корзину', value: formatNumber(data.cart), color: COLORS.cart},
      ];

  return (
    <g className="hidden sm:block" pointerEvents="none" transform={`translate(${x} ${y})`}>
      <rect
        width={width}
        height={height}
        rx="10"
        fill="#fff"
        stroke="#e2e8f0"
        filter="url(#seller-showcase-tooltip-shadow)"
      />
      <text x="14" y="20" fill="#0f172a" fontSize="10" fontWeight="600">{data.label}</text>
      {rows.map((row, index) => {
        const rowY = 39 + index * 17;

        return (
          <g key={row.label}>
            <circle cx="15" cy={rowY - 3} r="3.5" fill={row.color}/>
            <text x="25" y={rowY} fill="#64748b" fontSize="9.5">{row.label}</text>
            <text x={width - 13} y={rowY} textAnchor="end" fill="#0f172a" fontSize="9.5" fontWeight="600">
              {row.value}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function buildChart(
  primaryValues: number[],
  secondaryValues: number[],
  tertiaryValues: number[] | null,
  separateSecondaryScale: boolean,
) {
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const sharedValues = tertiaryValues
    ? [...primaryValues, ...secondaryValues, ...tertiaryValues]
    : primaryValues;
  const primaryMax = getScaleMax(sharedValues);
  const secondaryMax = separateSecondaryScale ? getScaleMax(secondaryValues) : primaryMax;
  const denominator = Math.max(primaryValues.length - 1, 1);
  const hitWidth = Math.max(44, plotWidth / denominator);
  const toPoints = (values: number[], max: number): Point[] => values.map((value, index) => ({
    x: PADDING.left + (plotWidth / denominator) * index,
    y: PADDING.top + plotHeight - (value / max) * plotHeight,
  }));
  const baseline = HEIGHT - PADDING.bottom;
  const toSeries = (values: number[], max: number) => {
    const points = toPoints(values, max);
    const path = toPath(points);
    const areaPath = `${path} L ${points.at(-1)?.x ?? PADDING.left} ${baseline} L ${points[0]?.x ?? PADDING.left} ${baseline} Z`;

    return {points, path, areaPath};
  };

  return {
    primaryMax,
    secondaryMax,
    hitWidth,
    primary: toSeries(primaryValues, primaryMax),
    secondary: toSeries(secondaryValues, secondaryMax),
    tertiary: tertiaryValues ? toSeries(tertiaryValues, primaryMax) : null,
  };
}

function toPath(points: Point[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

function getScaleMax(values: number[]) {
  const maxValue = Math.max(...values, 1);
  const rawStep = maxValue / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalizedStep = rawStep / magnitude;
  const stepFactor = [1, 1.5, 2, 2.5, 4, 5, 10].find(value => value >= normalizedStep) ?? 10;

  return stepFactor * magnitude * 4;
}

function compactNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }

  return String(value);
}
