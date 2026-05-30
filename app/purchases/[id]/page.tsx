import {findFirst} from "@/services/Orders";
import {serializeObject} from "@/services/utilits";
import OrderPage from "@/theme/templates/OrderPage";
import {createMetadata} from "@/lib/seo";

export async function generateMetadata({params}: any) {
  return createMetadata({
    title: `Заказ #${params.id}`,
    description: "Страница статуса заказа на spraby.",
    path: `/purchases/${params.id}`,
    noIndex: true,
  });
}

export default async function PurchasePage(props: any) {
  const order = await findFirst({
    where: {name: `#${props.params.id}`},
  });

  return !!order ? <OrderPage order={serializeObject(order)}/> :
    <div>no purchase</div>
}
