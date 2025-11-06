import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/query-client";
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
  const queryClient = getQueryClient();

  return (
    <html lang="en" className={inter.className}>
      <body className="m-0 p-0 bg-[#0f0f0f] overflow-auto min-h-screen">
        <div className="origin-top-left">
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <LayoutClient>{children}</LayoutClient>
            </ToastProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </div>
      </body>
    </html>
  );
}