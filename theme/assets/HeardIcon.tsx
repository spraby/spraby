'use client'

const HeardIcon = ({
  width = 24,
  height = 24,
  color = '#272738',
  filled = false,
  className
}: Props) => {
  const fill = filled ? color : 'none';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 23"
      fill={fill}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.2412 2.80367C18.8982 0.398776 15.0993 0.398776 12.7563 2.80367C12.4673 3.10031 12.2163 3.41952 11.9993 3.75516C11.7823 3.41952 11.5303 3.09928 11.2423 2.80367C8.89925 0.398776 5.10025 0.398776 2.75725 2.80367C0.41425 5.20857 0.41425 9.10793 2.75725 11.5128L11.9983 21L21.2412 11.5128C23.5842 9.10793 23.5842 5.20857 21.2412 2.80367Z"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="square"
      ></path>
    </svg>
  );
};

export default HeardIcon;

type Props = {
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
  className?: string;
};
