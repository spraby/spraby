import {Suspense} from "react";
import SearchPageContent from "./SearchPageContent";
import {createMetadata} from "@/lib/seo";

export const dynamic = 'force-dynamic';

export const metadata = createMetadata({
  title: "Поиск товаров",
  description: "Поиск авторских товаров, изделий ручной работы и товаров независимых брендов на spraby.",
  path: "/search",
  noIndex: true,
  follow: true,
});

const SearchPageFallback = () => (
  <main className="px-4 py-10 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-4xl rounded-2xl border border-dashed border-gray-200 bg-white/60 p-6 text-sm text-gray-500">
      Загрузка параметров поиска…
    </div>
  </main>
);

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback/>}>
      <SearchPageContent/>
    </Suspense>
  );
}
