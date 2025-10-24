import CollectionPage from "@/theme/templates/CollectionPage";

export default async function () {
  return <CollectionPage loading filter={[]} products={[]} total={0} pageSize={20}/>
}
