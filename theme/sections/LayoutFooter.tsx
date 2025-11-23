'use client'

import Link from "next/link";
import {useMemo} from "react";
import {MenuItem} from "@/types";

const LayoutFooter = ({menu}: { menu: MenuItem[] }) => {
  const primaryLinks = useMemo(() => {
    return (menu ?? [])
      .filter((item) => item?.url)
      .slice(0, 6)
      .map((item) => ({title: item.title, url: item.url as string}));
  }, [menu]);

  const catalogLinks = useMemo(() => {
    const categoryItems: { title: string; url: string }[] = [];
    (menu ?? []).forEach(item => {
      (item.children ?? []).forEach(child => {
        if (child?.url && categoryItems.length < 8) {
          categoryItems.push({title: child.title, url: child.url});
        }
      });
    });
    return categoryItems;
  }, [menu]);

  return (
    <footer className='mt-12 border-t border-gray-200 bg-gray-50'>
      <div className='mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8'>
        <div className='grid gap-10 lg:grid-cols-[1.2fr,1fr,1fr]'>
          <div className='flex flex-col gap-4'>
            <Link href='/' className='flex items-center text-purple-600'>
              <span className='text-2xl font-bold lowercase tracking-tight'>spraby</span>
            </Link>
            <p className='text-sm text-gray-600 leading-relaxed'>
              spraby — маркетплейс изделий мастеров и ремесленников. Мы объединяем
              уникальные товары, созданные с заботой, и покупателей, ценящих ручную работу.
            </p>
            <div className='flex flex-wrap gap-3 text-xs text-gray-500'>
              <span className='rounded-full bg-white/80 px-3 py-1 font-semibold text-purple-600 shadow-sm'>Handmade</span>
              <span className='rounded-full bg-white/80 px-3 py-1 font-semibold text-purple-600 shadow-sm'>Local brands</span>
              <span className='rounded-full bg-white/80 px-3 py-1 font-semibold text-purple-600 shadow-sm'>Eco friendly</span>
            </div>
          </div>

          <nav aria-label='Основное меню'>
            <h3 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Навигация</h3>
            <ul className='mt-4 space-y-3 text-sm text-gray-600'>
              {primaryLinks.map((item) => (
                <li key={item.url}>
                  <Link className='transition hover:text-purple-600' href={item.url}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label='Популярные разделы'>
            <h3 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Популярное</h3>
            <ul className='mt-4 space-y-3 text-sm text-gray-600'>
              {catalogLinks.map((item) => (
                <li key={item.url}>
                  <Link className='transition hover:text-purple-600' href={item.url}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className='mt-10 flex flex-col gap-3 border-t border-gray-200 pt-6 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between'>
          <span>© {new Date().getFullYear()} spraby. Все права защищены.</span>
          <div className='flex flex-wrap items-center gap-3'>
            <Link href='/privacy-policy' className='transition hover:text-purple-600'>Политика конфиденциальности</Link>
            <Link href='/terms-of-use' className='transition hover:text-purple-600'>Пользовательское соглашение</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LayoutFooter;
