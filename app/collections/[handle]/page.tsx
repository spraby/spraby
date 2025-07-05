import CollectionPage from "@/theme/templates/CollectionPage";
import {findFirst, getOptions as getCollectionOptions} from "@/services/Collections";
import {convertOptionsToFilter, convertSearchParamsToQueryParams} from "@/services/Options";
import {getFilteredProducts} from "@/services/Products";
import {CollectionModel} from "@/prisma/types";

export async function generateMetadata({ params }: any) {
  const collection = await findFirst({where: {handle: params.handle}}) as CollectionModel;

  return {
    title: collection?.meta_title,
    description: collection?.meta_description,
    keywords: collection?.meta_keywords,
  };
}

export default async function (props: any) {
  const options = await getCollectionOptions({handle: props.params.handle});
  const filter = await convertOptionsToFilter(options);
  const params = props?.searchParams ?? {};
  const data: any = await convertSearchParamsToQueryParams(params, filter);

  const products = await getFilteredProducts({
    options: Object.entries(data).map(([optionId, values]: any) => ({optionId, values})),
    collectionHandles: [props.params.handle]
  });

  return <CollectionPage
    products={products}
    filter={filter}
    searchParams={params}
    collectionHandle={props.params.handle}
  />
}
