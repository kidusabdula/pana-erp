"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import LayoutComponent from "@/components/Layout/Layout";
import { Toaster } from "sonner";
import { getQueryClient } from "@/lib/query-client";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <LayoutComponent>{children}</LayoutComponent>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}