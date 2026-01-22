import AuthPage from "@/theme/templates/AuthPage";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Стать продавцом | spraby",
  description: "Оставьте заявку на создание магазина на spraby.",
};

export default function LoginPage() {
  return <AuthPage />;
}
