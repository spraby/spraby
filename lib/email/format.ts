import {formatMoneyAmount, type MoneyInput} from '@/services/utilits';

export const formatEmailMoney = (value: MoneyInput) => formatMoneyAmount(value);
