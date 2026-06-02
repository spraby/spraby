import CollectionPage from "@/theme/templates/CollectionPage";
import {convertOptionsToFilter, convertSearchParamsToQueryParams} from "@/services/Options";
import {getFilteredProducts} from "@/services/Products";
import {getOptions, findFirst} from "@/services/Categories";
import {CategoryModel} from "@/prisma/types";
import {getBreadcrumbs} from "@/services/Settings";
import {categoryDescription, cleanText, createMetadata} from "@/lib/seo";
import {notFound} from "next/navigation";

export async function generateMetadata({params}: any) {
  const category = await findFirst({where: {handle: params.handle}}) as CategoryModel;
  const title = cleanText(category?.title || category?.name);

  if (!category) {
    return createMetadata({
      title: "Категория не найдена",
      description: "Категория товаров на spraby не найдена.",
      path: `/categories/${params.handle}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: title ? `${title} ручной работы и авторские товары` : "Каталог авторских товаров",
    description: categoryDescription(title, category.description),
    path: `/categories/${params.handle}`,
  });
}

export default async function CategoryPage(props: any) {
  const PAGE_SIZE = 20;
  const category = await findFirst({where: {handle: props.params.handle}}) as CategoryModel;

  if (!category) {
    notFound();
  }

  const options = await getOptions({handle: props.params.handle});
  const filter = await convertOptionsToFilter(options);
  const params = props?.searchParams ?? {}
  const optionGroups = await convertSearchParamsToQueryParams(params, filter);
  const breadcrumbs = await getBreadcrumbs(`/categories/${props.params.handle}`);

  const {items: products, total} = await getFilteredProducts({
    optionGroups,
    categoryHandles: [props.params.handle],
    limit: PAGE_SIZE,
    page: 1,
  });

  return <CollectionPage
    breadcrumbs={breadcrumbs}
    category={category}
    searchParams={params}
    products={products}
    total={total}
    pageSize={PAGE_SIZE}
    filter={filter}
  />
}
