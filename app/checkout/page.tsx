import CheckoutPage from "@/theme/templates/CheckoutPage";
import {createMetadata} from "@/lib/seo";

export const metadata = createMetadata({
  title: "Оформление заказа",
  description: "Оформление заказа на spraby.",
  path: "/checkout",
  noIndex: true,
});

export default async function Page() {
  return <CheckoutPage />;
}
