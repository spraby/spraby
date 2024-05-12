import CollectionPage from "@/theme/templates/CollectionPage";

export default async function (props: any) {
  return <CollectionPage searchParams={props.searchParams} collectionHandle={props.params.handle}/>
}
