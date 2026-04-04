// src/app/(auth)/login/page.tsx

import { AuthClient } from "@/components/auth/AuthClient";

export default function LoginPage() {
  return <AuthClient initialView="login" />;
}
