import {getOptions} from "@/services/Categories";
import {convertOptionsToFilter} from "@/services/Options";
import CollectionPage from "@/theme/templates/CollectionPage";

export default async function (props: any) {
  const options = await getOptions({handle: props.params.id})
  const filter = await convertOptionsToFilter(options)
  return <CollectionPage filter={filter} searchParams={props.searchParams} categoryHandle={props.params.handle}/>
}
