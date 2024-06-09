import CollectionPage from "@/theme/templates/CollectionPage";

export default async function (props: any) {
  const params =  props?.searchParams ?? {}
  return <CollectionPage filter={[]} products={[]} searchParams={params} loading/>
}
