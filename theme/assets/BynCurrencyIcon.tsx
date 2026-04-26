type BynCurrencyIconProps = {
  className?: string;
};

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

const hasHeightClass = (className = '') => /(?:^|\s)(?:h-|size-|\[height:)/.test(className);
const hasWidthClass = (className = '') => /(?:^|\s)(?:w-|size-|\[width:)/.test(className);

export function BynCurrencyIcon({className}: BynCurrencyIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={cx(
        !hasHeightClass(className) && 'h-[1cap]',
        !hasWidthClass(className) && 'w-[0.81cap]',
        className,
      )}
      overflow="visible"
      viewBox="0 0 360.67 446.4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="18"
        d="M475.61,528.84c0-72.5-62.75-131.27-140.16-131.27H227.58V263.37H426v-49.6H178v290h-63.1v49.7H178V660.17h49.54l107.92-.07c77.36,0,140.11-58.77,140.11-131.26Zm-248-25.1V447.1c35.89,0,72.35.07,107.87.07,50,0,90.56,36.57,90.56,81.67s-40.54,81.67-90.56,81.7l-107.87,0V553.44h112.7v-49.7Z"
        transform="translate(-114.94 -213.77)"
      />
    </svg>
  );
}

export default BynCurrencyIcon;
