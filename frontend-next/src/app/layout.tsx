import type { Metadata } from "next";
import type { ReactNode } from "react";
import "primeicons/primeicons.css";
// Light theme only (the design has no dark mode)
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "@/styles/style.scss";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "Books Admin", template: "%s | Books Admin" },
  description: "AI Frontend Training — Books admin built with Next.js and a Go API",
};

/** Root layout: wraps every page. Server component (no "use client"). */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
