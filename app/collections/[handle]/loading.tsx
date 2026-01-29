import CollectionPage from "@/theme/templates/CollectionPage";

export default async function CollectionLoading(props: any) {
  const params =  props?.searchParams ?? {}
  return <CollectionPage filter={[]} products={[]} total={0} pageSize={20} searchParams={params} loading/>
}
