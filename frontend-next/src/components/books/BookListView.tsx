"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { LinkButton } from "@/components/common/LinkButton";
import { PageHeader } from "@/components/common/PageHeader";
import { StateBox } from "@/components/common/StateBox";
import { useGetBooksList } from "@/hooks/API/books/useGetBooksList";
import { useDebounce } from "@/hooks/useDebounce";
import { parseApiError } from "@/utils/api-error";
import type { BookSortField, Genre, SortOrder } from "@/types/book";
import { BookCardList } from "./BookCardList";
import { BookFilters } from "./BookFilters";
import { BookListFooter, PAGE_SIZE_OPTIONS } from "./BookListFooter";
import { BookListLoading } from "./BookListLoading";
import { BookTable } from "./BookTable";
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

  // Any filter or sort change goes back to page 1
  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const changeGenre = (value: Genre | "") => {
    setGenre(value);
    setPage(1);
  };
  const changeSort = (field: BookSortField, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };
  const changePage = (p: number, l: number) => {
    setPage(l !== limit ? 1 : p);
    setLimit(l);
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
  const handleDelete = (book: Parameters<typeof confirmDelete>[0]) => confirmDelete(book, handleDeleted);

  // ---- Card body: loading / error / empty / data ----
  const hasFilters = debouncedSearch !== "" || genre !== "";
  let body;
  if (isLoading && !data) {
    body = <BookListLoading />;
  } else if (isError && !data) {
    body = (
      <StateBox
        tone="error"
        icon="pi-exclamation-circle"
        title="Could not load books"
        text={parseApiError(error).message}
        action={<Button label="Try again" outlined onClick={() => refetch()} />}
      />
    );
  } else if (!data || data.items.length === 0) {
    body = hasFilters ? (
      <StateBox
        icon="pi-search"
        title="No books match your search"
        text="Try a different title, author, ISBN or genre."
        action={<Button label="Clear filters" outlined onClick={resetFilters} />}
      />
    ) : (
      <StateBox
        icon="pi-book"
        title="No books yet"
        text="Books you add will appear here."
        action={<LinkButton href="/books/create" label="Add the first book" />}
      />
    );
  } else {
    // Both views are rendered; CSS shows the table above 1024px and cards below
    body = (
      <>
        <div className="book-view-table">
          <BookTable
            items={data.items}
            isFetching={isFetching}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={changeSort}
            onDelete={handleDelete}
          />
        </div>
        <div className="book-view-cards">
          <BookCardList items={data.items} onDelete={handleDelete} />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Books"
        subtitle="Manage the book catalogue"
        actions={<LinkButton href="/books/create" label="Add book" icon="pi pi-plus" />}
      />

      {/* List card: toolbar, body, footer */}
      <section className="book-list-card" aria-label="Book catalogue">
        <BookFilters
          search={search}
          genre={genre}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={changeSearch}
          onGenreChange={changeGenre}
          onSortChange={changeSort}
          onReset={resetFilters}
        />
        {body}
        {data && data.meta.total > 0 && <BookListFooter meta={data.meta} onPageChange={changePage} />}
      </section>
    </>
  );
}
