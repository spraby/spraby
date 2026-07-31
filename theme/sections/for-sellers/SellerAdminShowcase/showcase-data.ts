export type PeriodKey = 7 | 30 | 90;

export type CategoryStat = {
  label: string;
  value: number;
  color: string;
};

export type ChartPoint = {
  label: string;
  revenue: number;
  orders: number;
  views: number;
  cart: number;
};

export type ProductStat = {
  views: number;
  cart: number;
  orders: number;
  revenue: number;
};

export type DemoProduct = {
  name: string;
  category: string;
  accent: string;
  stats: Record<PeriodKey, ProductStat>;
};

export type DashboardPeriod = {
  dateLabel: string;
  views: number;
  cart: number;
  orders: number;
  revenue: number;
  paidOrders: number;
  unpaidOrders: number;
  unpaidTotal: number;
  units: number;
  categories: CategoryStat[];
  cartCategories: CategoryStat[];
  health: number;
  status: {
    pending: number;
    processing: number;
    completed: number;
  };
  attention: {
    pending: number;
    processing: number;
    unpaid: number;
  };
  chart: ChartPoint[];
};

const colors = ['#2563eb', '#f59e0b', '#10b981', '#64748b'];

export const DASHBOARD_PERIODS: Record<PeriodKey, DashboardPeriod> = {
  7: {
    dateLabel: '25–31 июля',
    views: 148,
    cart: 23,
    orders: 8,
    revenue: 684.5,
    paidOrders: 6,
    unpaidOrders: 2,
    unpaidTotal: 178,
    units: 11,
    categories: [
      {label: 'Украшения', value: 61, color: colors[0]},
      {label: 'Одежда', value: 43, color: colors[1]},
      {label: 'Для дома', value: 27, color: colors[2]},
      {label: 'Остальные', value: 17, color: colors[3]},
    ],
    cartCategories: [
      {label: 'Украшения', value: 10, color: colors[0]},
      {label: 'Одежда', value: 7, color: colors[1]},
      {label: 'Для дома', value: 4, color: colors[2]},
      {label: 'Остальные', value: 2, color: colors[3]},
    ],
    health: 88,
    status: {pending: 2, processing: 3, completed: 3},
    attention: {pending: 1, processing: 0, unpaid: 2},
    chart: [
      {label: '25 июл.', revenue: 0, orders: 0, views: 17, cart: 2},
      {label: '26 июл.', revenue: 82, orders: 1, views: 20, cart: 3},
      {label: '27 июл.', revenue: 129, orders: 2, views: 24, cart: 4},
      {label: '28 июл.', revenue: 54, orders: 1, views: 18, cart: 2},
      {label: '29 июл.', revenue: 178.5, orders: 2, views: 29, cart: 5},
      {label: '30 июл.', revenue: 91, orders: 1, views: 21, cart: 3},
      {label: '31 июл.', revenue: 150, orders: 1, views: 19, cart: 4},
    ],
  },
  30: {
    dateLabel: '2–31 июля',
    views: 612,
    cart: 94,
    orders: 31,
    revenue: 2846.5,
    paidOrders: 25,
    unpaidOrders: 6,
    unpaidTotal: 496,
    units: 39,
    categories: [
      {label: 'Украшения', value: 248, color: colors[0]},
      {label: 'Одежда', value: 177, color: colors[1]},
      {label: 'Для дома', value: 112, color: colors[2]},
      {label: 'Остальные', value: 75, color: colors[3]},
    ],
    cartCategories: [
      {label: 'Украшения', value: 39, color: colors[0]},
      {label: 'Одежда', value: 28, color: colors[1]},
      {label: 'Для дома', value: 17, color: colors[2]},
      {label: 'Остальные', value: 10, color: colors[3]},
    ],
    health: 82,
    status: {pending: 7, processing: 9, completed: 15},
    attention: {pending: 2, processing: 1, unpaid: 3},
    chart: [
      {label: '2 июл.', revenue: 188, orders: 2, views: 53, cart: 8},
      {label: '6 июл.', revenue: 305, orders: 4, views: 68, cart: 10},
      {label: '10 июл.', revenue: 247, orders: 3, views: 61, cart: 9},
      {label: '14 июл.', revenue: 436, orders: 5, views: 87, cart: 14},
      {label: '18 июл.', revenue: 354, orders: 4, views: 74, cart: 12},
      {label: '22 июл.', revenue: 527, orders: 5, views: 96, cart: 15},
      {label: '26 июл.', revenue: 371.5, orders: 4, views: 81, cart: 12},
      {label: '31 июл.', revenue: 418, orders: 4, views: 92, cart: 14},
    ],
  },
  90: {
    dateLabel: '3 мая–31 июля',
    views: 1842,
    cart: 286,
    orders: 92,
    revenue: 8472,
    paidOrders: 78,
    unpaidOrders: 14,
    unpaidTotal: 1134,
    units: 118,
    categories: [
      {label: 'Украшения', value: 731, color: colors[0]},
      {label: 'Одежда', value: 526, color: colors[1]},
      {label: 'Для дома', value: 349, color: colors[2]},
      {label: 'Остальные', value: 236, color: colors[3]},
    ],
    cartCategories: [
      {label: 'Украшения', value: 113, color: colors[0]},
      {label: 'Одежда', value: 82, color: colors[1]},
      {label: 'Для дома', value: 55, color: colors[2]},
      {label: 'Остальные', value: 36, color: colors[3]},
    ],
    health: 85,
    status: {pending: 18, processing: 25, completed: 49},
    attention: {pending: 4, processing: 2, unpaid: 5},
    chart: [
      {label: '3 мая', revenue: 684, orders: 8, views: 167, cart: 25},
      {label: '15 мая', revenue: 892, orders: 10, views: 194, cart: 31},
      {label: '27 мая', revenue: 756, orders: 9, views: 178, cart: 27},
      {label: '8 июн.', revenue: 1094, orders: 12, views: 231, cart: 36},
      {label: '20 июн.', revenue: 1278, orders: 14, views: 276, cart: 44},
      {label: '2 июл.', revenue: 1142, orders: 13, views: 248, cart: 38},
      {label: '14 июл.', revenue: 1389, orders: 15, views: 292, cart: 47},
      {label: '31 июл.', revenue: 1237, orders: 11, views: 256, cart: 38},
    ],
  },
};

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    name: 'Браслет из кожи',
    category: 'Браслеты',
    accent: 'bg-amber-100 text-amber-800',
    stats: {
      7: {views: 36, cart: 8, orders: 3, revenue: 270},
      30: {views: 142, cart: 27, orders: 10, revenue: 900},
      90: {views: 428, cart: 81, orders: 31, revenue: 2790},
    },
  },
  {
    name: 'Льняной тренч',
    category: 'Одежда',
    accent: 'bg-stone-100 text-stone-700',
    stats: {
      7: {views: 29, cart: 5, orders: 2, revenue: 238},
      30: {views: 117, cart: 20, orders: 7, revenue: 833},
      90: {views: 336, cart: 57, orders: 21, revenue: 2499},
    },
  },
  {
    name: 'Серьги «Капли»',
    category: 'Серьги',
    accent: 'bg-sky-100 text-sky-700',
    stats: {
      7: {views: 25, cart: 4, orders: 1, revenue: 74.5},
      30: {views: 103, cart: 18, orders: 5, revenue: 372.5},
      90: {views: 294, cart: 51, orders: 16, revenue: 1192},
    },
  },
  {
    name: 'Керамическая чашка',
    category: 'Посуда',
    accent: 'bg-emerald-100 text-emerald-700',
    stats: {
      7: {views: 22, cart: 3, orders: 1, revenue: 52},
      30: {views: 89, cart: 14, orders: 4, revenue: 208},
      90: {views: 266, cart: 43, orders: 13, revenue: 676},
    },
  },
  {
    name: 'Худи базовое',
    category: 'Худи',
    accent: 'bg-violet-100 text-violet-700',
    stats: {
      7: {views: 20, cart: 2, orders: 1, revenue: 50},
      30: {views: 83, cart: 10, orders: 3, revenue: 240},
      90: {views: 253, cart: 31, orders: 8, revenue: 640},
    },
  },
  {
    name: 'Свеча из соевого воска',
    category: 'Для дома',
    accent: 'bg-rose-100 text-rose-700',
    stats: {
      7: {views: 16, cart: 1, orders: 0, revenue: 0},
      30: {views: 78, cart: 5, orders: 2, revenue: 84},
      90: {views: 265, cart: 23, orders: 3, revenue: 126},
    },
  },
];

export const formatNumber = (value: number) => new Intl.NumberFormat('ru-BY').format(value);

export const formatMoney = (value: number) => `${new Intl.NumberFormat('ru-BY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value)} Br`;

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;
