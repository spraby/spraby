import CollectionPage from "@/theme/templates/CollectionPage";
import {getOptions} from "@/services/Collections";
import {convertOptionsToFilter} from "@/services/Options";

export default async function (props: any) {
  const options = await getOptions({handle: props.params.id})
  const filter = await convertOptionsToFilter(options)
  return <CollectionPage filter={filter} searchParams={props.searchParams} collectionHandle={props.params.handle}/>
}
