import CategoriesPage from "@/theme/templates/CategoriesPage";
import {getOptions} from "@/services/Categories";
import {convertOptionsToFilter} from "@/services/Options";

export default async function (props: any) {
  const options = await getOptions({handle: props.params.id})
  const filter = await convertOptionsToFilter(options)
  return <CategoriesPage filter={filter} searchParams={props.searchParams} handle={props.params.handle}/>
}
