import AuthPage from "@/theme/templates/AuthPage";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Вход | spraby",
  description: "Вход в аккаунт на spraby.",
};

export default function LoginPage() {
  return <AuthPage mode="login"/>;
}
