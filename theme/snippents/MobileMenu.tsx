'use client'

import Link from "next/link";
import {MenuItem} from "@/types";
import {Fragment, useEffect, useMemo, useState} from "react";
import {useBodyScrollLock} from "@/theme/hooks/useBodyScrollLock";
import {useRouter} from "next/navigation";

type MobileMenuProps = {
  menu: MenuItem[];
};

export default function MobileMenu({menu}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [trail, setTrail] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [openSuggest, setOpenSuggest] = useState(false);
  const [suggestions, setSuggestions] = useState<{loading: boolean; items: Array<{id: number | string; title: string; brand: string | null; price: string; final_price: string; image?: string | null}>}>({loading: false, items: []});
  const router = useRouter();

  const currentItems = useMemo(() => {
    if (!trail.length) return menu;
    return trail[trail.length - 1]?.children ?? [];
  }, [menu, trail]);

  useBodyScrollLock(isOpen);

  const handleOpen = () => {
    setTrail([]);
    setIsOpen(true);
  };

  const handleClose = () => {
    setTrail([]);
    setIsOpen(false);
    setOpenSuggest(false);
  };

  const handleBack = () => {
    setTrail((prev) => prev.slice(0, -1));
  };

  const handleDrilldown = (item: MenuItem) => {
    if (item.children?.length) {
      setTrail((prev) => [...prev, item]);
    }
  };

  const navigateToSearch = () => {
    const query = search.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    setOpenSuggest(false);
    handleClose();
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch();
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

  const activeCategory = trail[trail.length - 1];
  const isRoot = !trail.length;

  return (
    <Fragment>
      <button
        type="button"
        onClick={handleOpen}
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 lg:hidden"
        aria-label="Открыть меню каталога"
      >
        <BurgerIcon/>
      </button>

      <div className={`fixed inset-0 z-50 transition duration-300 lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleClose}
          aria-hidden="true"
        />

        <aside
          className={`ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Навигация по каталогу"
        >
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-1">
              {!isRoot && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 transition hover:bg-gray-100 active:bg-gray-200"
                  aria-label="Назад"
                >
                  <ChevronLeftIcon/>
                </button>
              )}
              <p className="text-base font-semibold text-gray-900">
                {isRoot ? 'Каталог' : activeCategory?.title}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:text-gray-800"
              aria-label="Закрыть меню"
            >
              <CloseIcon/>
            </button>
          </div>

          <div className="border-b border-gray-100 px-4 py-3">
            <label className="sr-only" htmlFor="mobile-menu-search">Поиск по каталогу</label>
            <div className="relative">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3"
              >
                <SearchIcon/>
                <input
                  id="mobile-menu-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => suggestions.items.length && setOpenSuggest(true)}
                  placeholder="Найти товар или категорию"
                  className="ml-2 h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  type="search"
                />
                <button
                  type="submit"
                  className="ml-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
                >
                  Найти
                </button>
              </form>

              {openSuggest && (suggestions.loading || suggestions.items.length > 0) && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-slate-300/30">
                  <div className="max-h-[60vh] overflow-y-auto">
                    {suggestions.loading && (
                      <div className="px-4 py-3 text-sm text-gray-500">Ищем…</div>
                    )}
                    {!suggestions.loading && suggestions.items.map((item) => {
                      const hasDiscount = Number(item.final_price) < Number(item.price);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            router.push(`/products/${item.id}`);
                            setOpenSuggest(false);
                            handleClose();
                          }}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-12 w-12 overflow-hidden rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center">
                              {item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.image} alt={item.title} className="h-full w-full object-cover"/>
                              ) : (
                                <span className="text-[11px] text-gray-400">Нет фото</span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</span>
                              {item.brand && <span className="text-xs text-gray-500">{item.brand}</span>}
                            </div>
                          </div>
                          <div className="text-xs font-semibold text-gray-900">
                            {item.final_price} BYN {hasDiscount && <span className="text-[11px] text-gray-400 line-through ml-1">{item.price} BYN</span>}
                          </div>
                        </button>
                      );
                    })}
                    {!suggestions.loading && suggestions.items.length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500">Ничего не найдено</div>
                    )}
                  </div>
                  <div className="border-t border-gray-100 px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={navigateToSearch}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                    >
                      Все результаты
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {!isRoot && activeCategory?.url && (
              <Link
                href={activeCategory.url}
                className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
                onClick={handleClose}
              >
                Смотреть все в «{activeCategory.title}»
                <ArrowOutIcon/>
              </Link>
            )}

            <nav aria-label={isRoot ? 'Основные разделы' : `Подразделы ${activeCategory?.title ?? ''}`}>
              <ul className="flex flex-col gap-1">
                {currentItems?.map((item) => {
                  const hasChildren = !!item.children?.length;
                  const itemKey = `${item.id}-${item.title}`;
                  return (
                    <li key={itemKey}>
                      <div className="group flex items-stretch rounded-lg border border-gray-100 bg-white transition hover:border-gray-200 hover:shadow">
                        {item.url ? (
                          <Link
                            href={item.url}
                            onClick={handleClose}
                            className="flex min-h-[3.25rem] flex-1 items-center px-4 text-sm font-medium text-gray-900 group-hover:text-purple-700"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <span className="flex min-h-[3.25rem] flex-1 items-center px-4 text-sm font-medium text-gray-900">
                            {item.title}
                          </span>
                        )}

                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() => handleDrilldown(item)}
                            className="flex w-12 items-center justify-center border-l border-gray-100 text-gray-400 transition hover:text-purple-600"
                            aria-label={`Открыть подразделы «${item.title}»`}
                          >
                            <ChevronRightIcon/>
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="border-t border-gray-100 px-4 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Быстрый доступ
            </p>
            <div className="flex flex-wrap gap-2">
              {quickLinks(menu).map((link) => (
                <Link
                  key={link.title}
                  href={link.url}
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-purple-300 hover:text-purple-700"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Fragment>
  );
}

type QuickLink = { title: string; url: string };

function quickLinks(menu: MenuItem[]): QuickLink[] {
  const links: QuickLink[] = [];

  const collect = (items: MenuItem[], depth = 0) => {
    for (const item of items) {
      if (links.length >= 6) return;
      if (item.url) {
        if (depth === 0) {
          links.push({title: item.title, url: item.url});
        } else if (depth === 1) {
          links.push({title: `${item.title}`, url: item.url});
        }
      }
      if (item.children?.length) {
        collect(item.children, depth + 1);
      }
    }
  };

  collect(menu);

  if (!links.length) {
    return [{title: 'Новые поступления', url: '/collections/new'}];
  }

  return links.slice(0, 6);
}

const BurgerIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 3l4 5-4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10 3L6 8l4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowOutIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M5.5 10.5L10.5 5.5M6 5.5h4.5V10"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M9.167 15a5.833 5.833 0 100-11.667 5.833 5.833 0 000 11.667zM15 15l-1.75-1.75"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
