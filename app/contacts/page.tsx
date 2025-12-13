import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Контакты — spraby",
  description: "Свяжитесь с командой spraby — маркетплейса изделий мастеров и ремесленников",
};

export default function ContactsPage() {
  return (
    <main className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Заголовок */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            Контакты
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 leading-relaxed">
            Мы всегда рады вашим вопросам и предложениям
          </p>
        </div>

        {/* Основная информация */}
        <div className="mb-12 grid gap-8 md:grid-cols-2">
          {/* Общие вопросы */}
          <div className="rounded-xl border border-purple-100 bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">Общие вопросы</h2>
            <p className="mb-4 text-sm text-gray-600">
              По вопросам работы платформы, сотрудничества и предложениям
            </p>
            <a
              href="mailto:info@spra.by"
              className="inline-flex items-center gap-2 text-purple-600 transition hover:text-purple-700"
            >
              <span className="font-medium">info@spra.by</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

          {/* Поддержка */}
          <div className="rounded-xl border border-purple-100 bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">Техническая поддержка</h2>
            <p className="mb-4 text-sm text-gray-600">
              Помощь с использованием сайта и решением технических проблем
            </p>
            <a
              href="mailto:support@spra.by"
              className="inline-flex items-center gap-2 text-purple-600 transition hover:text-purple-700"
            >
              <span className="font-medium">support@spra.by</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Социальные сети и мессенджеры */}
        <div className="mb-12 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 text-center">Мы в социальных сетях</h2>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://t.me/spraby"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-purple-200 bg-white px-6 py-3 shadow-sm transition hover:border-purple-300 hover:shadow-md"
            >
              <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
              <span className="font-medium text-gray-700">Telegram</span>
            </a>

            <a
              href="https://instagram.com/spraby"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-purple-200 bg-white px-6 py-3 shadow-sm transition hover:border-purple-300 hover:shadow-md"
            >
              <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="font-medium text-gray-700">Instagram</span>
            </a>
          </div>
        </div>

        {/* Адрес */}
        <div className="rounded-xl border border-purple-100 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Юридический адрес</h2>
              <p className="text-gray-600 leading-relaxed">
                Республика Беларусь<br />
                Минск
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Время работы: Пн-Пт, 9:00-18:00 (UTC+3)
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
