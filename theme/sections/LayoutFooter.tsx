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
        <div className='grid gap-10 lg:grid-cols-[1.2fr,1fr,1fr,1fr]'>
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
              <span className='rounded-full bg-white/80 px-3 py-1 font-semibold text-purple-600 shadow-sm'>Limited edition</span>
              <span className='rounded-full bg-white/80 px-3 py-1 font-semibold text-purple-600 shadow-sm'>Made in Belarus</span>
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

          <nav aria-label='Контакты'>
            <h3 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>Контакты</h3>
            <ul className='mt-4 space-y-3 text-sm text-gray-600'>
              <li>
                <Link className='transition hover:text-purple-600' href='/about'>
                  О нас
                </Link>
              </li>
              <li>
                <Link className='transition hover:text-purple-600' href='/contacts'>
                  Связаться с нами
                </Link>
              </li>
              <li>
                <a
                  className='inline-flex items-center gap-2 transition hover:text-purple-600'
                  href='https://instagram.com/spraby'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/>
                  </svg>
                  Instagram
                </a>
              </li>
              <li>
                <a
                  className='inline-flex items-center gap-2 transition hover:text-purple-600'
                  href='https://t.me/spraby'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z'/>
                  </svg>
                  Telegram
                </a>
              </li>
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
