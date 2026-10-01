import type { Metadata } from "next";
import { BookListView } from "@/components/books/BookListView";

export const metadata: Metadata = { title: "Books" };

// Server component; the interactive part lives in the client component BookListView.
export default function BooksListPage() {
  return <BookListView />;
}
