import CategoriesPage from "@/theme/templates/CategoriesPage";

export default async function (props: any) {
  return <CategoriesPage loading handle={props?.params?.handle ?? ''}/>
}
