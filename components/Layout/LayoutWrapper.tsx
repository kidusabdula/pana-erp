"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Layout from "./Layout";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Layout>{children}</Layout>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}