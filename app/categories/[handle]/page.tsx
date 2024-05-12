import CollectionPage from "@/theme/templates/CollectionPage";

export default async function (props: any) {
  return <CollectionPage searchParams={props.searchParams} categoryHandle={props.params.handle}/>
}
