import {useMemo, useState} from 'react';
import {FiChevronLeft, FiChevronRight, FiPackage} from 'react-icons/fi';

import {DEMO_PRODUCTS, formatMoney, formatNumber, formatPercent} from './showcase-data';
import type {DemoProduct, PeriodKey, ProductStat} from './showcase-data';

type TableMode = 'sales' | 'conversion';
type SortKey = 'views' | 'cart' | 'orders' | 'revenue' | 'viewToCart' | 'viewToOrder' | 'cartToOrder';

type SellerProductsSlideProps = {
  period: PeriodKey;
};

const PAGE_SIZE = 3;

export default function SellerProductsSlide({period}: SellerProductsSlideProps) {
  const [mode, setMode] = useState<TableMode>('sales');
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [descending, setDescending] = useState(true);
  const [page, setPage] = useState(1);

  const columns = mode === 'sales' ? SALES_COLUMNS : CONVERSION_COLUMNS;
  const sortedProducts = useMemo(() => [...DEMO_PRODUCTS].sort((first, second) => {
    const firstValue = getSortValue(first.stats[period], sortKey);
    const secondValue = getSortValue(second.stats[period], sortKey);
    return descending ? secondValue - firstValue : firstValue - secondValue;
  }), [descending, period, sortKey]);

  const pageCount = Math.ceil(sortedProducts.length / PAGE_SIZE);
  const safePage = Math.min(page, pageCount);
  const visibleProducts = sortedProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const changeMode = (nextMode: TableMode) => {
    setMode(nextMode);
    setSortKey(nextMode === 'sales' ? 'revenue' : 'viewToOrder');
    setDescending(true);
    setPage(1);
  };

  const changeSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setDescending(value => !value);
    } else {
      setSortKey(nextKey);
      setDescending(true);
    }
    setPage(1);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-3 sm:flex-row sm:items-start sm:justify-between sm:p-5 lg:p-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
            {mode === 'sales' ? 'Топ товаров по продажам' : 'Топ конверсии'}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            {mode === 'sales' ? 'Лидеры по выручке за период' : 'Товары, которые лучше превращают интерес в заказ'}
          </p>
        </div>
        <div className="inline-flex self-start rounded-xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Рейтинг товаров">
          <ModeButton active={mode === 'sales'} onClick={() => changeMode('sales')}>Топ продаж</ModeButton>
          <ModeButton active={mode === 'conversion'} onClick={() => changeMode('conversion')}>Топ конверсии</ModeButton>
        </div>
      </div>

      <div className="hidden grid-cols-[minmax(210px,1.4fr)_repeat(4,minmax(90px,.7fr))] items-center border-b border-slate-100 px-5 py-2 lg:grid">
        <span className="text-xs font-semibold text-slate-500">Товар</span>
        {columns.map(column => (
          <SortButton
            key={column.key}
            label={column.label}
            active={sortKey === column.key}
            descending={descending}
            onClick={() => changeSort(column.key)}
          />
        ))}
      </div>

      <div className="divide-y divide-slate-100">
        {visibleProducts.map(product => (
          <ProductRow key={product.name} product={product} period={period} columns={columns}/>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 lg:hidden" aria-label="Сортировка товаров">
          {columns.map(column => (
            <SortButton
              key={column.key}
              label={column.shortLabel}
              active={sortKey === column.key}
              descending={descending}
              compact
              onClick={() => changeSort(column.key)}
            />
          ))}
        </div>

        <p className="text-[11px] text-slate-500 sm:text-xs">Страница {safePage} из {pageCount}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(current => Math.max(1, current - 1))}
            disabled={safePage === 1}
            aria-label="Предыдущая страница"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-purple-200 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <FiChevronLeft aria-hidden="true"/>
          </button>
          <button
            type="button"
            onClick={() => setPage(current => Math.min(pageCount, current + 1))}
            disabled={safePage === pageCount}
            aria-label="Следующая страница"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-purple-200 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <FiChevronRight aria-hidden="true"/>
          </button>
        </div>
      </div>
    </article>
  );
}

type Column = {
  key: SortKey;
  label: string;
  shortLabel: string;
  render: (stats: ProductStat) => string;
};

const SALES_COLUMNS: Column[] = [
  {key: 'views', label: 'Просмотры', shortLabel: 'Просмотры', render: stats => formatNumber(stats.views)},
  {key: 'cart', label: 'Добавили в корзину', shortLabel: 'В корзину', render: stats => formatNumber(stats.cart)},
  {key: 'orders', label: 'Заказали', shortLabel: 'Заказы', render: stats => formatNumber(stats.orders)},
  {key: 'revenue', label: 'Выручка', shortLabel: 'Выручка', render: stats => formatMoney(stats.revenue)},
];

const CONVERSION_COLUMNS: Column[] = [
  {key: 'views', label: 'Просмотры', shortLabel: 'Просмотры', render: stats => formatNumber(stats.views)},
  {key: 'viewToCart', label: 'Просмотр → В корзину', shortLabel: 'В корзину', render: stats => formatPercent(getConversion(stats.views, stats.cart))},
  {key: 'viewToOrder', label: 'Просмотр → Заказ', shortLabel: 'В заказ', render: stats => formatPercent(getConversion(stats.views, stats.orders))},
  {key: 'cartToOrder', label: 'В корзину → Заказ', shortLabel: 'Корзина → заказ', render: stats => formatPercent(getConversion(stats.cart, stats.orders))},
];

function ProductRow({product, period, columns}: {
  product: DemoProduct;
  period: PeriodKey;
  columns: Column[];
}) {
  const stats = product.stats[period];

  return (
    <div className="p-3 sm:p-4 lg:grid lg:grid-cols-[minmax(210px,1.4fr)_repeat(4,minmax(90px,.7fr))] lg:items-center lg:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${product.accent}`}>
          <FiPackage aria-hidden="true" className="h-4 w-4"/>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">{product.category}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 lg:contents">
        {columns.map(column => (
          <div key={column.key} className="rounded-lg bg-slate-50 px-2.5 py-2 lg:bg-transparent lg:px-2 lg:text-right">
            <span className="block text-[9px] text-slate-400 lg:hidden">{column.shortLabel}</span>
            <strong className="mt-0.5 block text-[11px] font-semibold text-slate-700 sm:text-xs">
              {column.render(stats)}
            </strong>
          </div>
        ))}
      </div>
    </div>
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
      className={`min-h-8 rounded-lg px-2.5 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

function SortButton({label, active, descending, compact = false, onClick}: {
  label: string;
  active: boolean;
  descending: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${compact ? 'shrink-0 rounded-lg border px-2.5 py-1.5 text-[10px]' : 'px-2 py-2 text-right text-xs'} font-semibold transition ${
        active
          ? 'border-purple-200 bg-purple-50 text-purple-700'
          : 'border-slate-200 text-slate-500 hover:text-slate-800'
      }`}
    >
      {label} {active ? (descending ? '↓' : '↑') : '↕'}
    </button>
  );
}

function getConversion(from: number, to: number) {
  return from > 0 ? (to / from) * 100 : 0;
}

function getSortValue(stats: ProductStat, key: SortKey) {
  if (key === 'viewToCart') return getConversion(stats.views, stats.cart);
  if (key === 'viewToOrder') return getConversion(stats.views, stats.orders);
  if (key === 'cartToOrder') return getConversion(stats.cart, stats.orders);
  return stats[key];
}
