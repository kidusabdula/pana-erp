// app/layout.tsx
// Pana ERP v1.2 - Root Layout
import type { Metadata } from "next";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "Pana ERP",
  description: "Enterprise Resource Planning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Manrope Font - Premium, Geometric, Modern */}
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="m-0 p-0 overflow-x-hidden min-h-screen bg-background font-sans">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
