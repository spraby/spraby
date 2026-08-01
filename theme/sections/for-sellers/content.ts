import type {IconType} from 'react-icons';
import {
  FiCheckCircle,
  FiShoppingBag,
  FiUsers,
} from 'react-icons/fi';

export type SellerFeature = {
  title: string;
  description: string;
  icon: IconType;
};

export const START_STEPS = [
  {
    title: 'Зарегистрируйтесь',
    description: 'Подайте заявку на создание аккаунта и заполните профиль',
    icon: FiUsers,
  },
  {
    title: 'Добавьте товары',
    description: 'Загрузите фотографии, описание, варианты и цены',
    icon: FiShoppingBag,
  },
  {
    title: 'Принимайте заказы',
    description: 'Получайте заказы и контролируйте продажи в личном кабинете',
    icon: FiCheckCircle,
  },
] satisfies SellerFeature[];
