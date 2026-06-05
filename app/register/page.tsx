import AuthPage from "@/theme/templates/AuthPage";
import {createMetadata} from "@/lib/seo";

export const metadata = createMetadata({
  title: "Регистрация продавца",
  description: "Оставьте заявку на создание магазина на spraby и продавайте авторские товары, изделия ручной работы и вещи независимого бренда.",
  path: "/register",
});

export default function RegisterPage() {
  return <AuthPage/>;
}
