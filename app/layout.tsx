// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import LayoutComponent from "@/components/Layout";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pana ERP",
  description: "Custom ERP System for Pana Promotions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="m-0 p-0 bg-[#0f0f0f] overflow-auto min-h-screen">
        <div className="origin-top-left">
          <ToastProvider>
            <LayoutComponent>{children}</LayoutComponent>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
