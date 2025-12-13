import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "О нас — spraby",
  description: "Познакомьтесь с командой spraby — маркетплейса изделий мастеров и ремесленников",
};

export default function AboutPage() {
  return (
    <main className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Заголовок */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            О нас
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 leading-relaxed">
            Мы создали spraby, чтобы объединить талантливых мастеров и людей, которые ценят уникальные, созданные с душой вещи
          </p>
        </div>

        {/* История проекта */}
        <div className="mb-20 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-8 sm:p-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">Наша история</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              spraby родился из простой идеи: в мире массового производства должно быть место для вещей, созданных с заботой и вниманием к деталям. Мы верим, что за каждым изделием стоит история мастера, его опыт и душа.
            </p>
            <p>
              Наша платформа помогает ремесленникам находить своих покупателей, а людям — открывать для себя уникальные товары, которые невозможно найти в обычных магазинах. Каждая покупка на spraby поддерживает независимых творцов и развивает культуру осознанного потребления.
            </p>
          </div>
        </div>

        {/* Команда */}
        <div className="mb-12">
          <h2 className="mb-10 text-center text-3xl font-semibold text-gray-900">Наша команда</h2>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            {/* Михаил */}
            <div className="group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:border-purple-200 hover:shadow-md">
              <div className="mb-6">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-purple-100 bg-gradient-to-br from-purple-100 to-purple-200 shadow-md transition group-hover:border-purple-200">
                  <Image
                    src="/team/mikhail.jpg"
                    alt="Михаил"
                    fill
                    className="object-cover transition group-hover:scale-110"
                    sizes="112px"
                  />
                </div>
              </div>

              <div className="mb-3">
                <h3 className="mb-1 text-xl font-semibold text-gray-900">Михаил</h3>
                <p className="text-xs font-medium uppercase tracking-wide text-purple-600">Развитие и маркетинг</p>
              </div>

              <p className="mb-6 text-sm text-gray-600 leading-relaxed">
                Отвечает за стратегическое развитие платформы, партнёрства с мастерами и продвижение бренда.
              </p>

              <div className="flex flex-col gap-2 text-xs text-gray-500">
                <a href="mailto:mikhail@spra.by" className="flex items-center justify-center gap-1.5 transition hover:text-purple-600">
                  <svg className="h-3.5 w-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  mikhail@spra.by
                </a>
                <a href="https://t.me/mikhail_spraby" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center transition hover:text-purple-600" title="Telegram">
                  <svg className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Евгений */}
            <div className="group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:border-purple-200 hover:shadow-md">
              <div className="mb-6">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-blue-100 bg-gradient-to-br from-blue-100 to-blue-200 shadow-md transition group-hover:border-blue-200">
                  <Image
                    src="/team/evgeniy.jpg"
                    alt="Евгений"
                    fill
                    className="object-cover transition group-hover:scale-110"
                    sizes="112px"
                  />
                </div>
              </div>

              <div className="mb-3">
                <h3 className="mb-1 text-xl font-semibold text-gray-900">Евгений</h3>
                <p className="text-xs font-medium uppercase tracking-wide text-purple-600">Разработка и технологии</p>
              </div>

              <p className="mb-6 text-sm text-gray-600 leading-relaxed">
                Создаёт техническую инфраструктуру spraby, делая платформу удобной, быстрой и надёжной.
              </p>

              <div className="flex flex-col gap-2 text-xs text-gray-500">
                <a href="mailto:evgeniy@spra.by" className="flex items-center justify-center gap-1.5 transition hover:text-purple-600">
                  <svg className="h-3.5 w-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  evgeniy@spra.by
                </a>
                <a href="https://t.me/evgeniy_spraby" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center transition hover:text-purple-600" title="Telegram">
                  <svg className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Ценности */}
        <div className="mb-20 mt-20">
          <h2 className="mb-12 text-center text-3xl font-semibold text-gray-900">Наши ценности</h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-purple-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-7 w-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Ручная работа</h3>
              <p className="text-sm text-gray-600">
                Мы поддерживаем мастеров, которые создают изделия своими руками с душой и вниманием к деталям
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-7 w-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Сообщество</h3>
              <p className="text-sm text-gray-600">
                Создаём пространство для творческих людей и тех, кто ценит уникальные вещи
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-7 w-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Экологичность</h3>
              <p className="text-sm text-gray-600">
                Продвигаем осознанное потребление и поддерживаем локальное производство
              </p>
            </div>
          </div>
        </div>

        {/* Призыв к действию */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-12 text-center text-white shadow-xl">
          <h2 className="mb-4 text-3xl font-bold">Присоединяйтесь к нам</h2>
          <p className="mb-8 text-lg text-purple-100">
            Станьте частью сообщества мастеров или найдите уникальные вещи, созданные с любовью
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/collections"
              className="rounded-lg bg-white px-8 py-3 font-semibold text-purple-600 shadow-lg transition hover:bg-purple-50"
            >
              Смотреть товары
            </Link>
            <Link
              href="/contacts"
              className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Связаться с нами
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
