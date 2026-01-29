import CollectionPage from "@/theme/templates/CollectionPage";

export default async function CategoryLoading() {
  return <CollectionPage loading filter={[]} products={[]} total={0} pageSize={20}/>
}
