import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DetailHub — Find Boat & Car Detailing Near You",
    template: "%s | DetailHub",
  },
  description:
    "The national marketplace connecting boat and vehicle owners with elite, vetted detailing professionals. Get free quotes from local experts.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://detailhub.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
