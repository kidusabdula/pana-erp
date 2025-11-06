"use client";

import LayoutComponent from "@/components/Layout/Layout";
import { Toaster } from "sonner";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LayoutComponent>{children}</LayoutComponent>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}