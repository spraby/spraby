'use client'

const ChevronIcon = ({ width = 24, height = 24, color = '#272738' }: Props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16" fill="none">
      <path d="M3.5 9.5L8 5L12.5 9.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" stroke={color}></path>
    </svg>
  );
};

export default ChevronIcon;

type Props = {
  width?: number;
  height?: number;
  color?: string;
};
