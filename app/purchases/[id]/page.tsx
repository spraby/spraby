import {findFirst} from "@/services/Orders";
import {serializeObject} from "@/services/utilits";
import OrderPage from "@/theme/templates/OrderPage";

export default async function PurchasePage(props: any) {
  const order = await findFirst({
    where: {name: `#${props.params.id}`},
  });

  return !!order ? <OrderPage order={serializeObject(order)}/> :
    <div>no purchase</div>
}
