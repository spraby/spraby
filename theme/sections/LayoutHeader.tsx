import Link from "next/link";
import SearchIcon from "@/theme/assets/SearchIcon";
import HeardIcon from "@/theme/assets/HeardIcon";
import CartIcon from "@/theme/assets/CartIcon";

const LayoutHeader = ({}) => {

  return (
    <div className='shadow-lg shadow-slate-200'>
      <div className='container mx-auto'>
        <div className='flex flex-col'>
          <div
            className='bg-gray-800 p-2 text-center text-gray-200 text-xs rounded-bl-md rounded-br-md'>{'SPRABY'}</div>

          <div className='flex items-center flex-col gap-4 lg:flex-row lg:gap-10 py-2'>
            <h1 className='text-purple-600 text-2xl font-semibold'>
              <Link href={'/'}>SPRA.BY</Link>
            </h1>

            <div className='border-gray-300 grow border flex p-1 rounded-lg justify-center items-center gap-2'>
              <div className='px-2'>
                <SearchIcon />
              </div>
              <input className='p-2 w-full' placeholder={''}></input>
              <button className='bg-gray-200 text-gray-400 p-2 rounded-lg'>{'Serach'}</button>
            </div>

            <div className='flex gap-10'>
              <div className='flex gap-2'>
                <Link href='#' className='text-sm font-semibold p-1'>
                  Регистрация
                </Link>
                <div className='border-r-2'></div>
                <Link href='#' className='text-sm font-semibold p-1'>
                  Войти
                </Link>
              </div>

              <div className='flex gap-5'>
                <HeardIcon />
                <CartIcon />
              </div>
            </div>
          </div>
        </div>
        {/*<Menu menu={menu ?? []} />*/}
      </div>
    </div>
  );
};

export default LayoutHeader;
