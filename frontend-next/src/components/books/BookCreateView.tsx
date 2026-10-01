"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { useToast } from "@/app/providers";
import { useCreateBook } from "@/hooks/API/books/useBookMutations";
import type { BookInput } from "@/types/book";
import { BookForm } from "./BookForm";

/** /books/create */
export function BookCreateView() {
  const router = useRouter();
  const showToast = useToast();
  const createBook = useCreateBook();

  // Success: toast → list refreshes (hook invalidates) → back to list
  const handleSubmit = async (input: BookInput) => {
    const res = await createBook.mutateAsync(input);
    showToast({ severity: "success", summary: "Saved", detail: res.message ?? "Book created successfully" });
    router.push("/books/list");
  };

  return (
    <>
      <PageHeader title="Add book" subtitle="Fields marked * are required" backHref="/books/list" backLabel="Back to books" />
      <div className="book-form-wrapper">
        <BookForm
          submitLabel="Create book"
          isSaving={createBook.isPending}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/books/list")}
        />
      </div>
    </>
  );
}
