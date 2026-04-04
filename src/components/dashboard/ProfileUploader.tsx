// src/components/dashboard/ProfileUploader.tsx
// Vercel Blob photo upload for company profiles

"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

type Props = {
  label: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  accept?: string;
  aspectRatio?: "square" | "wide";
};

export function ProfileUploader({
  label,
  currentUrl,
  onUpload,
  accept = "image/jpeg,image/png,image/webp",
  aspectRatio = "square",
}: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", aspectRatio === "wide" ? "cover" : "logo");

      const res = await fetch("/api/companies/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      setPreview(url);
      onUpload(url);
    } catch {
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>

      <div
        className={`relative border-2 border-dashed border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 transition-colors ${
          aspectRatio === "wide" ? "h-32" : "h-24 w-24"
        }`}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <Image src={preview} alt="" fill className="object-cover" />
            <button
              type="button"
              className="absolute top-1 right-1 rounded-full bg-black/50 p-0.5 text-white"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                onUpload("");
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Upload</span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
