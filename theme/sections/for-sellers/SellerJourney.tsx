import Link from 'next/link';
import {FiArrowRight, FiCheck} from 'react-icons/fi';

import {START_STEPS} from './content';

export default function SellerJourney() {
  return (
    <>
      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[1.75rem] bg-[#f4f1ff] px-5 py-9 sm:px-8 sm:py-12 lg:px-12">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600">Простой старт</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">От идеи до первого заказа</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                Три понятных шага — без разработки собственного интернет-магазина.
              </p>
            </div>

            <ol className="mt-9 grid gap-3 lg:grid-cols-3 lg:gap-4">
              {START_STEPS.map((step, index) => {
                const Icon = step.icon;

                return (
                  <li key={step.title} className="relative rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                        <Icon aria-hidden="true" className="h-5 w-5"/>
                      </div>
                      <span className="text-3xl font-semibold text-purple-100">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-6 sm:pb-10 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600 px-5 py-10 text-white sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-14">
          <div aria-hidden="true" className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[44px] border-white/5"/>
          <div className="relative max-w-2xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-purple-50">
              <FiCheck aria-hidden="true" className="h-4 w-4"/>
              Размещение бесплатно
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Покажите свой бренд тем, кто ищет особенные вещи
            </h2>
            <p className="mt-3 text-sm leading-6 text-purple-100 sm:text-base">
              Создайте страницу бренда, добавьте товары и начните принимать заказы на spraby
            </p>
          </div>

          <div className="relative mt-7 flex justify-center lg:mt-0 lg:shrink-0">
            <Link
              href="/register"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-purple-700 shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:bg-purple-50 sm:w-auto"
            >
              Создать аккаунт
              <FiArrowRight aria-hidden="true" className="h-4 w-4"/>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
