import CollectionPage from "@/theme/templates/CollectionPage";
import {convertOptionsToFilter, convertSearchParamsToQueryParams} from "@/services/Options";
import {getFilteredProducts} from "@/services/Products";
import {getOptions, findFirst} from "@/services/Categories";
import {CategoryModel} from "@/prisma/types";
import {getBreadcrumbs, getMainMenu} from "@/services/Settings";

export async function generateMetadata({params}: any) {
  const category = await findFirst({where: {handle: params.handle}}) as CategoryModel;
  return {
    title: category?.title,
    description: category?.description,
  };
}

export default async function (props: any) {
  const category = await findFirst({where: {handle: props.params.handle}}) as CategoryModel;
  const options = await getOptions({handle: props.params.handle});
  const filter = await convertOptionsToFilter(options);
  const params = props?.searchParams ?? {}
  const data: any = await convertSearchParamsToQueryParams(params, filter);
  const breadcrumbs = await getBreadcrumbs(`/categories/${props.params.handle}`);

  const products = await getFilteredProducts({
    options: Object.entries(data).map(([optionId, values]: any) => ({optionId, values})),
    categoryHandles: [props.params.handle]
  });

  return <CollectionPage
    breadcrumbs={breadcrumbs}
    category={category}
    searchParams={params}
    products={products}
    filter={filter}
  />
}
