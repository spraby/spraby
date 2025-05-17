import CollectionPage from "@/theme/templates/CollectionPage";
import {convertOptionsToFilter, convertSearchParamsToQueryParams} from "@/services/Options";
import {getFilteredProducts} from "@/services/Products";
import {getOptions} from "@/services/Categories";

export default async function (props: any) {
  const options = await getOptions({handle: props.params.handle});
  const filter = await convertOptionsToFilter(options);
  const params = props?.searchParams ?? {}
  const data: any = await convertSearchParamsToQueryParams(params, filter);


  const products = await getFilteredProducts({
    options: Object.entries(data).map(([optionId, values]: any) => ({optionId, values})),
    categoryHandles: [props.params.handle]
  });

  return <CollectionPage
    searchParams={params}
    categoryHandle={props.params.handle}
    products={products}
    filter={filter}
  />
}
