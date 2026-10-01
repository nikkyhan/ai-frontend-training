import type { Metadata } from "next";
import type { ReactNode } from "react";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "@/styles/style.scss";
import { Providers } from "./providers";
import { THEME_INIT_SCRIPT } from "@/components/layout/theme";

export const metadata: Metadata = {
  title: { default: "Books Admin", template: "%s | Books Admin" },
  description: "AI Frontend Training — Books admin built with Next.js and a Go API",
};

/** Root layout: wraps every page. Server component (no "use client"). */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the theme script sets data-theme on <html> before React loads
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Runs first: applies the saved theme and adds the PrimeReact theme stylesheet */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
