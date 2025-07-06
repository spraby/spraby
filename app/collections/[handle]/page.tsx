import CollectionPage from "@/theme/templates/CollectionPage";
import {findFirst, getOptions as getCollectionOptions} from "@/services/Collections";
import {convertOptionsToFilter, convertSearchParamsToQueryParams} from "@/services/Options";
import {getFilteredProducts} from "@/services/Products";
import {CollectionModel} from "@/prisma/types";
import {getBreadcrumbs} from "@/services/Settings";

export async function generateMetadata({ params }: any) {
  const collection = await findFirst({where: {handle: params.handle}}) as CollectionModel;

  return {
    title: collection?.title,
    description: collection?.description,
  };
}

export default async function (props: any) {
  const collection = await findFirst({where: {handle: props.params.handle}}) as CollectionModel;
  const options = await getCollectionOptions({handle: props.params.handle});
  const filter = await convertOptionsToFilter(options);
  const params = props?.searchParams ?? {};
  const data: any = await convertSearchParamsToQueryParams(params, filter);
  const breadcrumbs = await getBreadcrumbs(`/collections/${props.params.handle}`);

  const products = await getFilteredProducts({
    options: Object.entries(data).map(([optionId, values]: any) => ({optionId, values})),
    collectionHandles: [props.params.handle]
  });

  return <CollectionPage
    breadcrumbs={breadcrumbs}
    collection={collection}
    products={products}
    filter={filter}
    searchParams={params}
  />
}
