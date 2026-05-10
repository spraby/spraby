import BynCurrencyIcon from "@/theme/assets/BynCurrencyIcon";
import {toMoney, type MoneyInput} from "@/services/utilits";
import {cx} from "@/lib/cx";

type MoneyProps = {
  value: MoneyInput;
  className?: string;
  showIcon?: boolean;
  fallback?: string;
};

/**
 * Вывод цены в денежном формате с иконкой валюты.
 * Иконка задаётся в одном месте — BynCurrencyIcon, чтобы её замена применилась глобально.
 * Цвет и размер шрифта контролируются через className на обёртке (наследуются спаном с числом
 * и через `currentColor` + `1cap` units передаются в иконку).
 */
export default function Money({value, className, showIcon = true, fallback = '—'}: MoneyProps) {
  const formatted = toMoney(value);

  if (formatted === '') {
    return <span className={className}>{fallback}</span>;
  }

  return (
    <span className={cx('inline-flex items-baseline gap-1.5 whitespace-nowrap', className)}>
      <span>{formatted}</span>
      {showIcon && <BynCurrencyIcon/>}
    </span>
  );
}
