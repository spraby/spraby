import Link from "next/link";
import {createMetadata} from "@/lib/seo";

export const metadata = createMetadata({
  title: "Страница не найдена",
  description: "Запрошенная страница не найдена на spraby.",
  path: null,
  noIndex: true,
});

export default function NotFound() {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[52vh] max-w-3xl flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 sm:text-5xl">
          Страница не найдена
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
          Возможно, ссылка устарела или товар, категория либо подборка больше не доступны.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            На главную
          </Link>
        </div>
      </section>
    </main>
  );
}
