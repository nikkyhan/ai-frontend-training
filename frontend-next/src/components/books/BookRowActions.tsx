"use client";

import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import type { Book } from "@/types/book";

interface BookRowActionsProps {
  book: Book;
  onDelete: (book: Book) => void;
}

/** View / edit / delete icon buttons, shared by the table rows and the mobile cards. */
export function BookRowActions({ book, onDelete }: BookRowActionsProps) {
  const router = useRouter();

  return (
    <div className="book-row-actions">
      <Button
        className="icon-button"
        icon="pi pi-eye"
        text
        rounded
        aria-label={`View ${book.title}`}
        onClick={() => router.push(`/books/details/${book.id}`)}
      />
      <Button
        className="icon-button"
        icon="pi pi-pencil"
        text
        rounded
        aria-label={`Edit ${book.title}`}
        onClick={() => router.push(`/books/edit/${book.id}`)}
      />
      <Button
        className="icon-button"
        icon="pi pi-trash"
        text
        rounded
        severity="danger"
        aria-label={`Delete ${book.title}`}
        onClick={() => onDelete(book)}
      />
    </div>
  );
}
