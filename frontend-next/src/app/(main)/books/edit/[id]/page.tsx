import type { Metadata } from "next";
import { BookEditView } from "@/components/books/BookEditView";

export const metadata: Metadata = { title: "Edit book" };

export default async function BookEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookEditView id={Number(id)} />;
}
