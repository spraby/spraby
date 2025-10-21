import Link from "next/link";
import SearchIcon from "@/theme/assets/SearchIcon";
import HeardIcon from "@/theme/assets/HeardIcon";
import CartIcon from "@/theme/assets/CartIcon";
import Menu from "@/theme/snippents/Menu";
import {MenuItem} from "@/types";
import MobileMenu from "@/theme/snippents/MobileMenu";

const LayoutHeader = ({menu}: { menu: MenuItem[] }) => {

  return (
    <div className='shadow-lg shadow-slate-200'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-3 lg:gap-0'>
          <div className='bg-gray-800 p-2 text-center text-gray-200 text-xs rounded-bl-md rounded-br-md'>SPRABY</div>

          <div className='flex items-center justify-between gap-3 py-3 lg:py-5'>
            <div className='flex items-center gap-3'>
              <Link href='/' className='text-purple-600 text-2xl font-bold lowercase tracking-tight'>
                spraby
              </Link>
            </div>

            <div className='hidden w-full max-w-2xl items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 lg:flex'>
              <SearchIcon/>
              <input className='w-full border-none bg-transparent py-1 text-sm text-gray-700 outline-none'
                     placeholder='Найдите бренд, товар или категорию'/>
              <button className='rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700'>
                Найти
              </button>
            </div>

            <div className='flex items-center gap-4 lg:gap-8'>
              <div className='hidden items-center gap-2 text-sm font-semibold text-gray-700 lg:flex'>
                <Link href='#' className='rounded-lg px-2 py-1 transition hover:text-purple-600'>
                  Регистрация
                </Link>
                <div className='h-4 w-px bg-gray-200'/>
                <Link href='#' className='rounded-lg px-2 py-1 transition hover:text-purple-600'>
                  Войти
                </Link>
              </div>

              <div className='flex items-center gap-4 text-gray-500'>
                <button
                  aria-label='Открыть избранное'
                  className='h-10 w-10 rounded-full border border-gray-200 p-2 transition hover:border-purple-200 hover:text-purple-600'>
                  <HeardIcon/>
                </button>
                <button
                  aria-label='Открыть корзину'
                  className='h-10 w-10 rounded-full border border-gray-200 p-2 transition hover:border-purple-200 hover:text-purple-600'>
                  <CartIcon/>
                </button>
                <MobileMenu menu={menu}/>
              </div>
            </div>
          </div>

          <div className='lg:hidden'/>
        </div>

        <div className='hidden lg:block'>
          <Menu menu={menu}/>
        </div>
      </div>
    </div>
  );
};

export default LayoutHeader;
