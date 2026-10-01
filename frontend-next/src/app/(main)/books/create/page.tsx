import type { Metadata } from "next";
import { BookCreateView } from "@/components/books/BookCreateView";

export const metadata: Metadata = { title: "Add book" };

export default function BookCreatePage() {
  return <BookCreateView />;
}
