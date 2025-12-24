'use client'

import Link from "next/link";
import {type FormEvent, useEffect, useMemo, useState} from "react";
import SearchIcon from "@/theme/assets/SearchIcon";
import HeardIcon from "@/theme/assets/HeardIcon";
import CartIcon from "@/theme/assets/CartIcon";
import Menu from "@/theme/snippents/Menu";
import {MenuItem} from "@/types";
import MobileMenu from "@/theme/snippents/MobileMenu";
import {useFavorites} from "@/theme/hooks/useFavorites";
import {useRouter} from "next/navigation";

const LayoutHeader = ({menu}: { menu: MenuItem[] }) => {
  const {count, ready} = useFavorites();
  const showBadge = ready && count > 0;
  const displayCount = useMemo(() => {
    if (!showBadge) return '';
    return count > 99 ? '99+' : String(count);
  }, [count, showBadge]);
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<{loading: boolean; items: Array<{id: number | string; title: string; brand: string | null; price: string; final_price: string; image?: string | null}>}>({loading: false, items: []});
  const [openSuggest, setOpenSuggest] = useState(false);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    setOpenSuggest(false);
  };

  useEffect(() => {
    const controller = new AbortController();
    const query = search.trim();
    if (query.length < 2) {
      setSuggestions((prev) => ({...prev, items: []}));
      setOpenSuggest(false);
      return;
    }
    let isActive = true;
    setSuggestions((prev) => ({...prev, loading: true}));
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=12`, {signal: controller.signal});
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: {items: Array<{id: number | string; title: string; brand: string | null; price: string; final_price: string; image?: string | null}>} = await res.json();
        if (!isActive) return;
        setSuggestions({loading: false, items: data.items ?? []});
        setOpenSuggest(true);
      } catch (err) {
        if (!isActive || (err instanceof DOMException && err.name === "AbortError")) return;
        setSuggestions({loading: false, items: []});
        setOpenSuggest(false);
      }
    }, 200);

    return () => {
      isActive = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [search]);

  return (
    <div className='shadow-lg shadow-slate-200'>
      <div className='mx-auto max-w-6xl'>
        <div className='flex flex-col gap-3 lg:gap-0'>
          <div className='bg-gray-800 mx-4 sm:mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0 py-2 text-center text-gray-200 text-xs rounded-bl-md rounded-br-md'>
            spraby — маркетплейс по продаже товаров мастеров и ремесленников
          </div>

          <div className='flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-0 py-3 lg:py-5'>
            <div className='flex items-center gap-3'>
              <Link href='/' className='text-purple-600 text-2xl font-bold lowercase tracking-tight'>
                spraby
              </Link>
            </div>

            <div className='hidden w-full max-w-2xl lg:flex'>
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
                      {!suggestions.loading && suggestions.items.map((item) => {
                        const hasDiscount = Number(item.final_price) < Number(item.price);
                        return (
                          <button
                            key={item.id}
                            type='button'
                            onClick={() => {
                              router.push(`/products/${item.id}`);
                              setOpenSuggest(false);
                            }}
                            className='flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50'
                          >
                            <div className='flex items-center gap-3 min-w-0'>
                              <div className='h-12 w-12 overflow-hidden rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center'>
                                {item.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={item.image} alt={item.title} className='h-full w-full object-cover'/>
                                ) : (
                                  <span className='text-[11px] text-gray-400'>Нет фото</span>
                                )}
                              </div>
                              <div className='flex flex-col min-w-0'>
                                <span className='text-sm font-semibold text-gray-900 line-clamp-1'>{item.title}</span>
                                {item.brand && <span className='text-xs text-gray-500'>{item.brand}</span>}
                              </div>
                            </div>
                            <div className='text-xs font-semibold text-gray-900'>
                              {item.final_price} BYN {hasDiscount && <span className='text-[11px] text-gray-400 line-through ml-1'>{item.price} BYN</span>}
                            </div>
                          </button>
                        );
                      })}
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
                <Link href='/login' className='rounded-lg px-2 py-1 transition hover:text-purple-600'>
                  Войти
                </Link>
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
                {/*<button*/}
                {/*  aria-label='Открыть корзину'*/}
                {/*  className='h-10 w-10 rounded-full border border-gray-200 p-2 transition hover:border-purple-200 hover:text-purple-600'>*/}
                {/*  <CartIcon/>*/}
                {/*</button>*/}
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
