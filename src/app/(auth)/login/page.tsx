import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your AutoClip account.",
};

export default function LoginPage() {
  return <LoginForm />;
}
