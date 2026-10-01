"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { USE_MOCK } from "@/utils/api-integration";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/books/list", label: "Books", match: "/books" },
  { href: "/books/create", label: "Add book", match: "/books/create" },
];

/** Top bar: brand, main navigation, mock-mode badge and theme toggle. */
export function AppHeader() {
  const pathname = usePathname();

  // "Add book" wins over "Books" when both prefixes match
  const activeHref = [...NAV_ITEMS].reverse().find((item) => pathname.startsWith(item.match))?.href;

  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* Brand */}
        <Link href="/books/list" className="app-brand" aria-label="Books Admin home">
          <i className="pi pi-book" aria-hidden="true" />
          <span className="app-brand-text">Books Admin</span>
        </Link>

        {/* Navigation */}
        <nav className="app-nav" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`app-nav-link${activeHref === item.href ? " is-active" : ""}`}
              aria-current={activeHref === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mode badge + theme */}
        {USE_MOCK && <span className="mock-badge">Mock data</span>}
        <ThemeToggle />
      </div>
    </header>
  );
}
