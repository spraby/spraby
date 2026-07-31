import Link from 'next/link';
import {FiArrowRight, FiBarChart2, FiCheck, FiGift, FiUsers} from 'react-icons/fi';

export default function ForSellersHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f7f5ff]">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-purple-300/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-purple-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-purple-700 shadow-sm">
            Для мастеров и локальных брендов
          </span>

          <h1 className="mx-auto mt-5 max-w-4xl text-[2.45rem] font-semibold leading-[1.04] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.7rem]">
            Продавай на spraby.
            <br/>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Все в одном кабинете
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Размещайте товары, управляйте заказами и смотрите аналитику продаж.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_-18px_rgba(124,58,237,0.9)] transition hover:-translate-y-0.5 hover:bg-purple-700"
            >
              Начать продавать
              <FiArrowRight aria-hidden="true" className="h-4 w-4"/>
            </Link>
            <Link
              href="#seller-cabinet"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-purple-200 bg-white px-6 py-3 text-sm font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-50"
            >
              Посмотреть кабинет
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
            {['Бесплатное размещение', 'Без собственного сайта', 'Всё в одном кабинете'].map(item => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <FiCheck aria-hidden="true" className="h-4 w-4 text-emerald-500"/>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-3">
          <HeroBenefit
            icon={FiGift}
            title="Бесплатное размещение"
            description="Без платы за публикацию товаров"
          />
          <HeroBenefit
            icon={FiBarChart2}
            title="Аналитика продаж"
            description="Просмотры, заказы и выручка"
          />
          <HeroBenefit
            icon={FiUsers}
            title="Встроенная CRM"
            description="Заказы и статусы под контролем"
          />
        </div>
      </div>
    </section>
  );
}

type HeroBenefitProps = {
  icon: typeof FiGift;
  title: string;
  description: string;
};

function HeroBenefit({icon: Icon, title, description}: HeroBenefitProps) {
  return (
    <article className="flex items-center gap-3 rounded-2xl border border-white/90 bg-white/75 p-4 text-left shadow-[0_18px_45px_-36px_rgba(76,29,149,0.45)] backdrop-blur-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
        <Icon aria-hidden="true" className="h-5 w-5"/>
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </article>
  );
}
