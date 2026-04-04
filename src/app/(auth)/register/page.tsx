// src/app/(auth)/register/page.tsx
// Redirects to the combined auth page (register view)
// Note: claim flow (?claim=xxx) preserved for backward compatibility

import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ claim?: string; [key: string]: string | undefined }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  // Preserve any query params (e.g. ?claim=xxx) by passing them through
  const qs = new URLSearchParams();
  qs.set("view", "register");
  if (params.claim) qs.set("claim", params.claim);
  redirect(`/login?${qs.toString()}`);
}
