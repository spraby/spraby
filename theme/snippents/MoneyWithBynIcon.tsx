import BynCurrencyIcon from "@/theme/assets/BynCurrencyIcon";
import {formatMoneyAmount, parseMoneyAmount} from "@/services/utilits";

const cx = (...classes: Array<string | undefined | false | null>) => classes.filter(Boolean).join(' ');

type MoneyWithBynIconProps = {
  value: number | string | null | undefined;
  formatter?: Intl.NumberFormat;
  className?: string;
  valueClassName?: string;
  iconClassName?: string;
  fallback?: string;
  showIcon?: boolean;
};

export function MoneyWithBynIcon({
  value,
  formatter,
  className,
  valueClassName,
  iconClassName,
  fallback = '—',
  showIcon = true,
}: MoneyWithBynIconProps) {
  const numericValue = parseMoneyAmount(value);
  const iconClasses = cx('shrink-0', iconClassName);

  if (typeof numericValue !== 'number' || !Number.isFinite(numericValue)) {
    return <span className={cx(valueClassName, className)}>{fallback}</span>;
  }

  const formattedValue = formatter
    ? formatter.format(numericValue)
    : formatMoneyAmount(numericValue, fallback);

  return (
    <span className={cx('inline-flex items-baseline gap-1.5 whitespace-nowrap', valueClassName, className)}>
      <span>{formattedValue}</span>
      {showIcon && <BynCurrencyIcon className={iconClasses}/>}
    </span>
  );
}

export default MoneyWithBynIcon;
