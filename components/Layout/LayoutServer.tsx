import { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { Toaster } from "sonner";

interface LayoutServerProps {
  children: ReactNode;
}

export default function LayoutServer({ children }: LayoutServerProps) {
  return (
    <QueryProvider>
      {children}
      <Toaster position="top-right" richColors />
    </QueryProvider>
  );
}