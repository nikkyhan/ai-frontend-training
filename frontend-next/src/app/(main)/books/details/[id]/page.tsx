import type { Metadata } from "next";
import { BookDetailsView } from "@/components/books/BookDetailsView";

export const metadata: Metadata = { title: "Book details" };

// Next.js 15: dynamic route params arrive as a Promise.
export default async function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookDetailsView id={Number(id)} />;
}
