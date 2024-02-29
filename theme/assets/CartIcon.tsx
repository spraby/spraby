'use client'

const CartIcon = ({width = 24, height = 24, color = '#272738'}: Props) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3.81818V22H22V3.81818" stroke={color} strokeWidth="2" strokeMiterlimit="10"></path>
      <path
        d="M17 10.1818C17 12.7273 14.8 14.7273 12 14.7273C9.2 14.7273 7 12.7273 7 10.1818"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="square"
      ></path>
      <path
        d="M20 5.63636H4C2.9 5.63636 2 4.81818 2 3.81818C2 2.81818 2.9 2 4 2H20C21.1 2 22 2.81818 22 3.81818C22 4.81818 21.1 5.63636 20 5.63636Z"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="square"
      ></path>
    </svg>
  );
};

export default CartIcon;

type Props = {
  width?: number;
  height?: number;
  color?: string;
};
