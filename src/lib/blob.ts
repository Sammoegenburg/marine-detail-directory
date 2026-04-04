// src/lib/blob.ts
// Vercel Blob helpers for company photo uploads

import { put, del } from "@vercel/blob";

export async function uploadCompanyPhoto(
  file: File,
  companySlug: string,
  type: "logo" | "cover" | "gallery"
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `companies/${companySlug}/${type}-${Date.now()}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  return blob.url;
}

export async function deleteBlob(url: string): Promise<void> {
  await del(url);
}
