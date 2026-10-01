"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "primereact/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { StateBox } from "@/components/common/StateBox";
import { LinkButton } from "@/components/common/LinkButton";
import { useToast } from "@/app/providers";
import { useGetBookDetails } from "@/hooks/API/books/useGetBookDetails";
import { useUpdateBook } from "@/hooks/API/books/useBookMutations";
import { parseApiError } from "@/utils/api-error";
import type { BookInput } from "@/types/book";
import { BookForm } from "./BookForm";

/** /books/edit/[id] — loads the book, then shows the form filled with its values. */
export function BookEditView({ id }: { id: number }) {
  const router = useRouter();
  const showToast = useToast();
  const { data: book, isLoading, isError, error } = useGetBookDetails(id);
  const updateBook = useUpdateBook(id);

  const handleSubmit = async (input: BookInput) => {
    const res = await updateBook.mutateAsync(input);
    showToast({ severity: "success", summary: "Saved", detail: res.message ?? "Book updated successfully" });
    router.push("/books/list");
  };

  // Loading
  if (isLoading) {
    return (
      <>
        <PageHeader title="Edit book" backHref="/books/list" backLabel="Back to books" />
        <div className="content-card" aria-busy="true">
          <Skeleton height="2.5rem" className="skeleton-gap" />
          <Skeleton height="2.5rem" className="skeleton-gap" />
          <Skeleton height="6rem" />
        </div>
      </>
    );
  }

  // Not found / error
  if (isError || !book) {
    const parsed = parseApiError(error);
    return (
      <>
        <PageHeader title="Edit book" backHref="/books/list" backLabel="Back to books" />
        <div className="content-card">
          <StateBox
            tone="error"
            icon="pi-exclamation-circle"
            title={parsed.status === 404 ? "Book not found" : "Could not load book"}
            text={parsed.message}
            action={<LinkButton href="/books/list" label="Go to book list" outlined />}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Edit book" subtitle={book.title} backHref={`/books/details/${id}`} backLabel="Back to details" />
      {/* key: re-create form state if another book is loaded */}
      <div className="book-form-wrapper">
        <BookForm
          key={book.id}
          initial={book}
          submitLabel="Save changes"
          isSaving={updateBook.isPending}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/books/details/${id}`)}
        />
      </div>
    </>
  );
}
