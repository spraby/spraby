import CollectionPage from "@/theme/templates/CollectionPage";

export default async function (props: any) {
  return <CollectionPage loading collectionHandle={props?.params?.handle}/>
}
