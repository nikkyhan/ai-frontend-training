"use client";

import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { StateBox } from "@/components/common/StateBox";
import { LinkButton } from "@/components/common/LinkButton";
import { useGetBookDetails } from "@/hooks/API/books/useGetBookDetails";
import { parseApiError } from "@/utils/api-error";
import { formatDate, formatGenre, formatPrice, formatTimestampDate } from "@/utils/format";
import { StockTag } from "./StockTag";
import { useConfirmDeleteBook } from "./useConfirmDeleteBook";

const BACK = { backHref: "/books/list", backLabel: "Back to books" };

/** /books/details/[id] — read-only view with Edit and Delete. */
export function BookDetailsView({ id }: { id: number }) {
  const router = useRouter();
  const { data: book, isLoading, isError, error } = useGetBookDetails(id);
  const { confirmDelete, isDeleting } = useConfirmDeleteBook();

  // Loading
  if (isLoading) {
    return (
      <>
        <PageHeader title="Book details" {...BACK} />
        <div className="content-card" aria-busy="true">
          <Skeleton height="1.5rem" width="50%" className="skeleton-gap" />
          <Skeleton height="1.5rem" width="70%" className="skeleton-gap" />
          <Skeleton height="4rem" />
        </div>
      </>
    );
  }

  // Not found / error
  if (isError || !book) {
    const parsed = parseApiError(error);
    return (
      <>
        <PageHeader title="Book details" {...BACK} />
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

  // Data
  return (
    <>
      <PageHeader
        title={book.title}
        subtitle={`by ${book.author}`}
        {...BACK}
        actions={
          <>
            <LinkButton href={`/books/edit/${book.id}`} label="Edit" icon="pi pi-pencil" outlined />
            <Button
              label="Delete"
              icon="pi pi-trash"
              severity="danger"
              outlined
              loading={isDeleting}
              onClick={() => confirmDelete(book, () => router.push("/books/list"))}
            />
          </>
        }
      />

      <section className="content-card" aria-label="Book information">
        <dl className="book-details-grid">
          <div className="book-details-item">
            <dt>ISBN</dt>
            <dd className="book-isbn">{book.isbn}</dd>
          </div>
          <div className="book-details-item">
            <dt>Genre</dt>
            <dd>
              <span className="genre-tag">{formatGenre(book.genre)}</span>
            </dd>
          </div>
          <div className="book-details-item">
            <dt>Published</dt>
            <dd>{formatDate(book.publishedDate)}</dd>
          </div>
          <div className="book-details-item">
            <dt>Price</dt>
            <dd>{formatPrice(book.price)}</dd>
          </div>
          <div className="book-details-item">
            <dt>Stock</dt>
            <dd>
              <StockTag stock={book.stock} />
            </dd>
          </div>
        </dl>

        {/* Description — own section under a divider (Figma) */}
        <dl className="book-description-section">
          <div className="book-details-item">
            <dt>Description</dt>
            <dd className={`book-description${book.description ? "" : " is-empty"}`}>
              {book.description || "No description"}
            </dd>
          </div>
        </dl>
      </section>

      {/* Audit info, below the card */}
      <p className="book-meta">
        Created {formatTimestampDate(book.createdAt)} · Last updated {formatTimestampDate(book.updatedAt)}
      </p>
    </>
  );
}
