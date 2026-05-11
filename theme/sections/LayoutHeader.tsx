'use client'

import Link from "next/link";
import Image from "next/image";
import {type FormEvent, useEffect, useMemo, useRef, useState} from "react";
import SearchIcon from "@/theme/assets/SearchIcon";
import HeardIcon from "@/theme/assets/HeardIcon";
import CartIcon from "@/theme/assets/CartIcon";
import Menu from "@/theme/snippents/Menu";
import {MenuItem} from "@/types";
import MobileMenu from "@/theme/snippents/MobileMenu";
import {useFavorites} from "@/theme/hooks/useFavorites";
import {useCart} from "@/theme/hooks/useCart";
import {useRouter} from "next/navigation";
import {useProductSuggestions} from "@/theme/hooks/useProductSuggestions";
import SearchSuggestionItem from "@/theme/snippents/SearchSuggestionItem";

const SHOW_HEADER_PROMO_BAR = false;
const ADMIN_LOGIN_URL = process.env.LOGIN_URL || 'http://localhost:8000/admin';

const LayoutHeader = ({menu}: { menu: MenuItem[] }) => {
  const {count, ready} = useFavorites();
  const {totalItems, ready: cartReady} = useCart();
  const showBadge = ready && count > 0;
  const showCartBadge = cartReady && totalItems > 0;
  const displayCount = useMemo(() => {
    if (!showBadge) return '';
    return count > 99 ? '99+' : String(count);
  }, [count, showBadge]);
  const cartDisplayCount = useMemo(() => {
    if (!showCartBadge) return '';
    return totalItems > 99 ? '99+' : String(totalItems);
  }, [totalItems, showCartBadge]);
  const router = useRouter();
  const [search, setSearch] = useState('');
  const {suggestions, open: openSuggest, setOpen: setOpenSuggest} = useProductSuggestions(search);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    setOpenSuggest(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpenSuggest(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpenSuggest]);

  return (
    <>
      <div className='shadow-lg shadow-slate-200'>
        <div className='mx-auto max-w-6xl'>
          <div className='flex flex-col gap-3 lg:gap-0'>
            {SHOW_HEADER_PROMO_BAR && (
              <div className='bg-gray-800 mx-4 sm:mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0 py-2 text-center text-gray-200 text-xs rounded-bl-md rounded-br-md'>
                spraby — маркетплейс авторских товаров
              </div>
            )}

            <div className='flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-0 py-3 lg:py-5'>
              <div className='flex items-center gap-3'>
                <Link href='/' className='text-purple-600 text-2xl font-bold lowercase tracking-tight flex items-center gap-2.5'>
                  <Image
                    src="/img/spraby.svg"
                    alt="spraby — логотип"
                    width={40}
                    height={32}
                    className="h-8 w-auto"
                    priority
                  />
                  <span className="leading-none">spraby</span>
                </Link>
              </div>

              <div className='hidden w-full max-w-2xl lg:flex' ref={wrapperRef}>
                <form
                  onSubmit={handleSearchSubmit}
                  className='relative flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5'
                >
                  <SearchIcon/>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => suggestions.items.length && setOpenSuggest(true)}
                    className='w-full border-none bg-transparent py-1 text-sm text-gray-700 outline-none'
                    placeholder='Найдите товар или категорию'
                  />
                  <button
                    type='submit'
                    className='rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700'
                  >
                    Найти
                  </button>

                  {openSuggest && (suggestions.loading || suggestions.items.length > 0) && (
                    <div className='absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-gray-100 bg-white shadow-xl shadow-slate-300/30'>
                      <div className='max-h-[70vh] overflow-y-auto'>
                        {suggestions.loading && (
                          <div className='px-4 py-3 text-sm text-gray-500'>Ищем…</div>
                        )}
                        {!suggestions.loading && suggestions.items.map((item) => (
                          <SearchSuggestionItem
                            key={item.id}
                            item={item}
                            onSelect={() => {
                              router.push(`/products/${item.id}`);
                              setOpenSuggest(false);
                            }}
                          />
                        ))}
                        {!suggestions.loading && suggestions.items.length === 0 && (
                          <div className='px-4 py-3 text-sm text-gray-500'>Ничего не найдено</div>
                        )}
                      </div>
                      <div className='border-t border-gray-100 px-4 py-2 text-right'>
                        <button
                          type='submit'
                          className='text-xs font-semibold text-purple-600 hover:text-purple-700'
                        >
                          Все результаты
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className='flex items-center gap-4 lg:gap-8'>
                <div className='hidden items-center gap-2 text-sm font-semibold text-gray-700 lg:flex'>
                  <Link href='/register' className='rounded-lg px-2 py-1 transition hover:text-purple-600'>
                    Регистрация
                  </Link>
                  <div className='h-4 w-px bg-gray-200'/>
                  <a href={ADMIN_LOGIN_URL} className='rounded-lg px-2 py-1 transition hover:text-purple-600'>
                    Войти
                  </a>
                </div>

                <div className='flex items-center gap-4 text-gray-500'>
                  <Link
                    href='/favorites'
                    aria-label='Открыть избранное'
                    className='relative flex h-10 w-10 items-center justify-center rounded-full p-2 transition hover:bg-gray-100 hover:text-purple-600'
                  >
                    <HeardIcon color={showBadge ? '#db2777' : undefined} filled={showBadge}/>
                    {showBadge && (
                      <span className='absolute -top-1 -right-1 inline-flex min-h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-purple-600 px-1 text-[0.65rem] font-semibold text-white'>
                        {displayCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href='/checkout'
                    aria-label='Открыть корзину'
                    className='relative flex h-10 w-10 items-center justify-center rounded-full p-2 transition hover:bg-gray-100 hover:text-purple-600'
                  >
                    <CartIcon/>
                    {showCartBadge && (
                      <span className='absolute -top-1 -right-1 inline-flex min-h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-purple-600 px-1 text-[0.65rem] font-semibold text-white'>
                        {cartDisplayCount}
                      </span>
                    )}
                  </Link>
                  <MobileMenu menu={menu} adminLoginUrl={ADMIN_LOGIN_URL}/>
                </div>
              </div>
            </div>

            <div className='lg:hidden'/>
          </div>
        </div>
      </div>

      <div className='hidden lg:block lg:sticky lg:top-0 lg:z-10 bg-white'>
        <div className='mx-auto max-w-6xl'>
          <Menu menu={menu}/>
        </div>
      </div>
    </>
  );
};

export default LayoutHeader;
