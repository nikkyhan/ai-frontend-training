import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";

export default function NotFound() {
  return (
    <>
      <AppHeader />
      <main className="main-container">
        <div className="content-card state-box">
          <i className="pi pi-compass" aria-hidden="true" />
          <h1 className="state-title">Page not found</h1>
          <p className="state-text">The page you are looking for does not exist.</p>
          <Link href="/books/list">Go to book list</Link>
        </div>
      </main>
    </>
  );
}
