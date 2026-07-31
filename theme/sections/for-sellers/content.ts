import type {IconType} from 'react-icons';
import {
  FiBell,
  FiCheckCircle,
  FiGrid,
  FiPackage,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiUsers,
} from 'react-icons/fi';

export type SellerFeature = {
  title: string;
  description: string;
  icon: IconType;
};

export const PLATFORM_TOOLS: SellerFeature[] = [
  {
    title: 'Витрина бренда',
    description: 'Отдельная страница, которая знакомит покупателей с вами и вашими товарами.',
    icon: FiGrid,
  },
  {
    title: 'Управление товарами',
    description: 'Фотографии, варианты, характеристики, цены и скидки в одном каталоге.',
    icon: FiPackage,
  },
  {
    title: 'Контроль заказов',
    description: 'Понятные статусы помогают не потерять заказ и вовремя перейти к следующему этапу.',
    icon: FiCheckCircle,
  },
  {
    title: 'Настройки доставки',
    description: 'Указывайте доступные способы и условия доставки для своих покупателей.',
    icon: FiTruck,
  },
  {
    title: 'Уведомления',
    description: 'Получайте информацию о новых заказах и быстрее начинайте их обработку.',
    icon: FiBell,
  },
  {
    title: 'Новая аудитория',
    description: 'Товары появляются в поиске, категориях, новинках и подборках маркетплейса.',
    icon: FiSearch,
  },
];

export const START_STEPS = [
  {
    title: 'Зарегистрируйтесь',
    description: 'Создайте аккаунт и расскажите немного о своём бренде.',
    icon: FiUsers,
  },
  {
    title: 'Добавьте товары',
    description: 'Загрузите фотографии, описание, варианты и цены.',
    icon: FiShoppingBag,
  },
  {
    title: 'Принимайте заказы',
    description: 'Получайте заказы и контролируйте продажи в личном кабинете.',
    icon: FiCheckCircle,
  },
] satisfies SellerFeature[];
