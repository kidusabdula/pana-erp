import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import LayoutClient from "./LayoutClient";
import "@/styles/globals.css";

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
            <LayoutClient>{children}</LayoutClient>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}