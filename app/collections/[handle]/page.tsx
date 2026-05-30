import CollectionPage from "@/theme/templates/CollectionPage";
import {findFirst, getOptions as getCollectionOptions} from "@/services/Collections";
import {convertOptionsToFilter, convertSearchParamsToQueryParams} from "@/services/Options";
import {getFilteredProducts} from "@/services/Products";
import {CollectionModel} from "@/prisma/types";
import {getBreadcrumbs} from "@/services/Settings";
import {cleanText, collectionDescription, createMetadata} from "@/lib/seo";
import {notFound} from "next/navigation";

export async function generateMetadata({ params }: any) {
  const collection = await findFirst({where: {handle: params.handle}}) as CollectionModel;
  const title = cleanText(collection?.meta_title || collection?.title || collection?.name);
  const description = collection?.meta_description || collection?.description;

  if (!collection) {
    return createMetadata({
      title: "Подборка не найдена",
      description: "Подборка авторских товаров на spraby не найдена.",
      path: `/collections/${params.handle}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: title || "Подборка авторских товаров",
    description: collectionDescription(title, description),
    path: `/collections/${params.handle}`,
  });
}

export default async function Page(props: any) {
  const PAGE_SIZE = 20;
  const collection = await findFirst({where: {handle: props.params.handle}}) as CollectionModel;

  if (!collection) {
    notFound();
  }

  const options = await getCollectionOptions({handle: props.params.handle});
  const filter = await convertOptionsToFilter(options);
  const params = props?.searchParams ?? {};
  const data: any = await convertSearchParamsToQueryParams(params, filter);
  const breadcrumbs = await getBreadcrumbs(`/collections/${props.params.handle}`);

  const {items: products, total} = await getFilteredProducts({
    options: Object.entries(data).map(([optionId, values]: any) => ({optionId, values})),
    collectionHandles: [props.params.handle],
    limit: PAGE_SIZE,
    page: 1,
  });

  return <CollectionPage
    breadcrumbs={breadcrumbs}
    collection={collection}
    products={products}
    total={total}
    pageSize={PAGE_SIZE}
    filter={filter}
    searchParams={params}
  />
}
