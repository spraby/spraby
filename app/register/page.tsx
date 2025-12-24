import AuthPage from "@/theme/templates/AuthPage";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Регистрация | spraby",
  description: "Создайте профиль на spraby, чтобы сохранять избранное и покупать у любимых брендов.",
};

export default function RegisterPage() {
  return <AuthPage mode="register"/>;
}
