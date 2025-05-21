import CollectionPage from "@/theme/templates/CollectionPage";
import {getOptions as getCollectionOptions} from "@/services/Collections";
import {convertOptionsToFilter, convertSearchParamsToQueryParams} from "@/services/Options";
import {getFilteredProducts} from "@/services/Products";

export default async function (props: any) {
  const options = await getCollectionOptions({handle: props.params.handle});
  console.log('options => ', options);

  const filter = await convertOptionsToFilter(options);
  console.log('filter => ', filter);

  const params = props?.searchParams ?? {};
  console.log('params => ', params);

  const data: any = await convertSearchParamsToQueryParams(params, filter);
  console.log('data => ', data)

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
