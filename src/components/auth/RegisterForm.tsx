"use client";

// src/components/auth/RegisterForm.tsx
// Thin wrapper — resolves claim context from server then delegates to AuthClient

import { AuthClient } from "./AuthClient";

type ClaimCompany = {
  name: string;
  cityName: string;
  stateName: string;
} | null;

type Props = {
  claimSlug?: string;
  claimCompany: ClaimCompany;
};

export function RegisterForm({ claimSlug, claimCompany }: Props) {
  return (
    <AuthClient
      initialView="register"
      claimSlug={claimSlug}
      claimCompany={claimCompany}
    />
  );
}
