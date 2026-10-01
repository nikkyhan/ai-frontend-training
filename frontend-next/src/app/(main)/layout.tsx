import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

/** Layout for every page in the (main) route group. The group name is not part of the URL. */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="main-container">{children}</main>
    </>
  );
}
