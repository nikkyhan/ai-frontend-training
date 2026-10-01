"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { LinkButton } from "@/components/common/LinkButton";
import { PageHeader } from "@/components/common/PageHeader";
import { StateBox } from "@/components/common/StateBox";
import { useGetBooksList } from "@/hooks/API/books/useGetBooksList";
import { useDebounce } from "@/hooks/useDebounce";
import { parseApiError } from "@/utils/api-error";
import { formatNumber } from "@/utils/format";
import type { BookSortField, Genre, SortOrder } from "@/types/book";
import { BookFilters } from "./BookFilters";
import { BookTable, PAGE_SIZE_OPTIONS } from "./BookTable";
import { useConfirmDeleteBook } from "./useConfirmDeleteBook";

/** /books/list — search, filter, sort, page and delete books. */
export function BookListView() {
  // ---- Screen state (only this page needs it, so plain useState) ----
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<Genre | "">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE_OPTIONS[0]);
  const [sortBy, setSortBy] = useState<BookSortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const debouncedSearch = useDebounce(search.trim());

  // ---- Server data (TanStack Query owns it) ----
  const { data, isLoading, isFetching, isError, error, refetch } = useGetBooksList({
    search: debouncedSearch,
    genre,
    sortBy,
    sortOrder,
    page,
    limit,
  });
  const { confirmDelete } = useConfirmDeleteBook();

  // Any filter change goes back to page 1
  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const changeGenre = (value: Genre | "") => {
    setGenre(value);
    setPage(1);
  };
  const resetFilters = () => {
    setSearch("");
    setGenre("");
    setPage(1);
  };

  // If the last row on a page is deleted, step back one page
  const handleDeleted = () => {
    if (data && data.items.length === 1 && page > 1) setPage(page - 1);
  };

  const hasFilters = debouncedSearch !== "" || genre !== "";
  const emptyState = hasFilters ? (
    <StateBox
      icon="pi-search"
      title="No books match your search"
      text="Try a different title, author, ISBN or genre."
      action={<Button label="Clear filters" icon="pi pi-filter-slash" outlined onClick={resetFilters} />}
    />
  ) : (
    <StateBox
      icon="pi-book"
      title="No books yet"
      text="Books you add will appear here."
      action={<LinkButton href="/books/create" label="Add the first book" icon="pi pi-plus" />}
    />
  );

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Books"
        subtitle="Manage the book catalogue"
        actions={<LinkButton href="/books/create" label="Add book" icon="pi pi-plus" />}
      />

      {/* Filters */}
      <BookFilters
        search={search}
        genre={genre}
        onSearchChange={changeSearch}
        onGenreChange={changeGenre}
        onReset={resetFilters}
      />

      {/* Error: keep the filters visible so the user can retry */}
      {isError && !data ? (
        <div className="content-card">
          <StateBox
            tone="error"
            icon="pi-exclamation-circle"
            title="Could not load books"
            text={parseApiError(error).message}
            action={<Button label="Try again" icon="pi pi-refresh" outlined onClick={() => refetch()} />}
          />
        </div>
      ) : (
        <>
          {/* Result count */}
          {data && data.meta.total > 0 && (
            <p className="book-result-count" aria-live="polite">
              {formatNumber(data.meta.total)} {data.meta.total === 1 ? "book" : "books"}
            </p>
          )}

          {/* Table */}
          <BookTable
            result={data}
            isInitialLoading={isLoading}
            isFetching={isFetching}
            sortBy={sortBy}
            sortOrder={sortOrder}
            emptyState={emptyState}
            onPageChange={(p, l) => {
              setPage(l !== limit ? 1 : p);
              setLimit(l);
            }}
            onSortChange={(field, order) => {
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
            }}
            onDelete={(book) => confirmDelete(book, handleDeleted)}
          />
        </>
      )}
    </>
  );
}
