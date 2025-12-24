import AuthPage from "@/theme/templates/AuthPage";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Вход | spraby",
  description: "Войдите в аккаунт spraby, чтобы управлять покупками и избранным.",
};

export default function LoginPage() {
  return <AuthPage mode="login"/>;
}
