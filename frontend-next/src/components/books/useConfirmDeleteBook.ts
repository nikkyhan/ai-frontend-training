"use client";

import { confirmDialog } from "primereact/confirmdialog";
import { useToast } from "@/app/providers";
import { useDeleteBook } from "@/hooks/API/books/useBookMutations";
import { parseApiError } from "@/utils/api-error";
import type { Book } from "@/types/book";

/** Asks "are you sure?", deletes, then shows a toast. onDeleted runs only on success. */
export function useConfirmDeleteBook() {
  const deleteBook = useDeleteBook();
  const showToast = useToast();

  const confirmDelete = (book: Pick<Book, "id" | "title">, onDeleted?: () => void) => {
    confirmDialog({
      header: "Delete book",
      message: `Delete "${book.title}"? This cannot be undone.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClassName: "p-button-danger",
      defaultFocus: "reject",
      accept: async () => {
        try {
          const res = await deleteBook.mutateAsync(book.id);
          showToast({ severity: "success", summary: "Deleted", detail: res.message });
          onDeleted?.();
        } catch (error) {
          showToast({ severity: "error", summary: "Delete failed", detail: parseApiError(error).message });
        }
      },
    });
  };

  return { confirmDelete, isDeleting: deleteBook.isPending };
}
