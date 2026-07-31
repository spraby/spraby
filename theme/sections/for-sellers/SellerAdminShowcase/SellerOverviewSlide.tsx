import {FiAlertCircle, FiCheckCircle} from 'react-icons/fi';

import type {DashboardPeriod} from './showcase-data';
import {formatMoney, formatNumber, formatPercent} from './showcase-data';

type SellerOverviewSlideProps = {
  data: DashboardPeriod;
  detailsOpen: boolean;
  onToggleDetails: () => void;
};

export default function SellerOverviewSlide({
  data,
  detailsOpen,
  onToggleDetails,
}: SellerOverviewSlideProps) {
  const viewToCart = data.views > 0 ? (data.cart / data.views) * 100 : 0;
  const viewToOrder = data.views > 0 ? (data.orders / data.views) * 100 : 0;
  const cartToOrder = data.cart > 0 ? (data.orders / data.cart) * 100 : 0;
  const viewToPaid = data.views > 0 ? (data.paidOrders / data.views) * 100 : 0;
  const orderToPaid = data.orders > 0 ? (data.paidOrders / data.orders) * 100 : 0;
  const averageOrder = data.orders > 0 ? data.revenue / data.orders : 0;
  const statusTotal = data.status.pending + data.status.processing + data.status.completed;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
        <MetricCard label="Просмотры" value={formatNumber(data.views)}>
          <CategoryRows items={data.categories}/>
        </MetricCard>

        <MetricCard label="Добавления в корзину" value={formatNumber(data.cart)}>
          <CategoryRows items={data.cartCategories}/>
        </MetricCard>

        <MetricCard label="Заказы" value={formatNumber(data.orders)}>
          <div className="flex flex-wrap gap-1">
            <StatChip label="Просмотр → корзина" value={formatPercent(viewToCart)}/>
            <StatChip label="Корзина → заказ" value={formatPercent(cartToOrder)}/>
          </div>
          <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-[10px] text-slate-500 sm:text-xs">
            <DetailRow label="Средний чек" value={formatMoney(averageOrder)}/>
            <DetailRow label="Продано единиц" value={formatNumber(data.units)}/>
          </div>
        </MetricCard>

        <MetricCard label="Выручка" value={formatMoney(data.revenue)}>
          <div className="flex flex-wrap gap-1">
            <StatChip label="Просмотр → оплата" value={formatPercent(viewToPaid)}/>
            <StatChip label="Заказ → оплата" value={formatPercent(orderToPaid)}/>
          </div>
          <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-[10px] text-slate-500 sm:text-xs">
            <DetailRow label="Оплаченные" value={formatNumber(data.paidOrders)}/>
            <DetailRow label="Неоплаченные" value={formatNumber(data.unpaidOrders)}/>
          </div>
        </MetricCard>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 lg:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">Актуальность статусов</h3>
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500 sm:text-xs">
              Видно, где застряли заказы и что требует внимания
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleDetails}
            aria-expanded={detailsOpen}
            className="inline-flex min-h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-purple-200 hover:text-purple-700"
          >
            {detailsOpen ? 'Скрыть детали' : 'Показать детали'}
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
          <div className="flex items-center gap-3">
            <HealthRing value={data.health}/>
            <div>
              <p className="text-xs font-semibold text-slate-800">Свежесть статусов</p>
              <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">{statusTotal} активных заказов</p>
              <p className="text-[10px] text-amber-600 sm:text-xs">
                {data.attention.pending + data.attention.processing + data.attention.unpaid} требуют внимания
              </p>
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <StatusBar
              segments={[
                {label: 'Ожидает', value: data.status.pending, color: '#f59e0b'},
                {label: 'В обработке', value: data.status.processing, color: '#a855f7'},
                {label: 'Завершено', value: data.status.completed, color: '#10b981'},
              ]}
            />
            <StatusBar
              segments={[
                {label: 'Не оплачено', value: data.unpaidTotal, color: '#ef4444', suffix: formatMoney(data.unpaidTotal)},
                {label: 'Оплачено', value: data.revenue, color: '#10b981', suffix: formatMoney(data.revenue)},
              ]}
            />
          </div>
        </div>

        {detailsOpen ? (
          <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <AttentionCard label="Ожидает подтверждения > 2 дн." value={data.attention.pending}/>
            <AttentionCard label="В обработке > 5 дн." value={data.attention.processing}/>
            <AttentionCard label="Не оплачен > 3 дн." value={data.attention.unpaid}/>
          </div>
        ) : null}
      </article>
    </div>
  );
}

function MetricCard({label, value, children}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <p className="min-h-8 text-[10px] leading-4 text-slate-500 sm:min-h-0 sm:text-xs">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-2xl">{value}</p>
      <div className="mt-3 border-t border-slate-100 pt-2.5">{children}</div>
    </article>
  );
}

function CategoryRows({items}: {items: DashboardPeriod['categories']}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      <p className="mb-1.5 text-[8px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[10px]">Категории</p>
      <div className="space-y-1">
        {items.slice(0, 3).map(item => (
          <div key={item.label} className="flex items-center justify-between gap-1 text-[9px] sm:text-[11px]">
            <span className="flex min-w-0 items-center gap-1.5 text-slate-500">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{backgroundColor: item.color}}/>
              <span className="truncate">{item.label}</span>
            </span>
            <span className="shrink-0 font-medium text-slate-700">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatChip({label, value}: {label: string; value: string}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 px-1.5 py-0.5 text-[8px] text-slate-500 sm:text-[10px]">
      <span className="truncate">{label}</span>
      <strong className="shrink-0 font-semibold text-slate-800">{value}</strong>
    </span>
  );
}

function DetailRow({label, value}: {label: string; value: string}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate">{label}</span>
      <strong className="shrink-0 font-medium text-slate-800">{value}</strong>
    </div>
  );
}

function HealthRing({value}: {value: number}) {
  return (
    <div
      className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full sm:h-20 sm:w-20"
      style={{background: `conic-gradient(#10b981 0deg ${value * 3.6}deg, #e2e8f0 ${value * 3.6}deg 360deg)`}}
    >
      <div className="absolute inset-1.5 rounded-full bg-white"/>
      <span className="relative text-sm font-semibold text-slate-900 sm:text-base">{value}%</span>
    </div>
  );
}

function StatusBar({segments}: {
  segments: {label: string; value: number; color: string; suffix?: string}[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
        {segments.map(segment => (
          <span
            key={segment.label}
            style={{width: `${total > 0 ? (segment.value / total) * 100 : 0}%`, backgroundColor: segment.color}}
          />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-500 sm:text-[11px]">
        {segments.map(segment => (
          <span key={segment.label} className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{backgroundColor: segment.color}}/>
            {segment.label}
            <strong className="font-semibold text-slate-700">{segment.suffix ?? formatNumber(segment.value)}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function AttentionCard({label, value}: {label: string; value: number}) {
  const hasAttention = value > 0;

  return (
    <div className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[11px] sm:text-xs ${
      hasAttention ? 'border-amber-200 bg-amber-50/70 text-amber-950' : 'border-emerald-100 bg-emerald-50/60 text-emerald-900'
    }`}>
      <span className="inline-flex items-center gap-1.5">
        {hasAttention ? <FiAlertCircle aria-hidden="true"/> : <FiCheckCircle aria-hidden="true"/>}
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}
