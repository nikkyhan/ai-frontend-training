"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import type { ReactNode } from "react";
import type { Book, BookListResult, BookSortField, SortOrder } from "@/types/book";
import { formatDate, formatGenre, formatPrice } from "@/utils/format";
import { StockTag } from "./StockTag";

export const PAGE_SIZE_OPTIONS = [10, 20, 50];
const SKELETON_ROWS = 5;

interface BookTableProps {
  result: BookListResult | undefined;
  isInitialLoading: boolean;
  isFetching: boolean;
  sortBy: BookSortField;
  sortOrder: SortOrder;
  emptyState: ReactNode;
  onPageChange: (page: number, limit: number) => void;
  onSortChange: (field: BookSortField, order: SortOrder) => void;
  onDelete: (book: Book) => void;
}

/** Server-paged, server-sorted book table. Rows scroll sideways inside the card on small screens. */
export function BookTable(props: BookTableProps) {
  const { result, isInitialLoading, isFetching, sortBy, sortOrder, emptyState } = props;
  const router = useRouter();

  // First load: show grey placeholder rows with the same columns
  const skeleton = isInitialLoading && !result;
  const rows: Book[] = skeleton
    ? Array.from({ length: SKELETON_ROWS }, (_, i) => ({ id: -i - 1 }) as Book)
    : (result?.items ?? []);
  const cell = (render: (b: Book) => ReactNode) =>
    function CellBody(b: Book) {
      return skeleton ? <Skeleton width="80%" /> : render(b);
    };

  const limit = result?.meta.limit ?? PAGE_SIZE_OPTIONS[0];
  const page = result?.meta.page ?? 1;

  const handlePage = (e: DataTablePageEvent) => props.onPageChange((e.page ?? 0) + 1, e.rows);
  const handleSort = (e: DataTableSortEvent) =>
    props.onSortChange((e.sortField as BookSortField) ?? "createdAt", e.sortOrder === 1 ? "asc" : "desc");

  return (
    <div className="book-table-card">
      <div className="book-table-scroll">
        <DataTable
          value={rows}
          dataKey="id"
          lazy
          paginator={!skeleton && (result?.meta.total ?? 0) > 0}
          first={(page - 1) * limit}
          rows={limit}
          totalRecords={result?.meta.total ?? 0}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          onPage={handlePage}
          sortField={sortBy === "createdAt" ? undefined : sortBy}
          sortOrder={sortOrder === "asc" ? 1 : -1}
          onSort={handleSort}
          loading={isFetching && !skeleton}
          emptyMessage={emptyState}
          stripedRows
          aria-busy={isFetching}
          aria-label="Books"
        >
          {/* Title + author */}
          <Column
            field="title"
            header="Title"
            sortable
            body={cell((b) => (
              <div className="book-title-cell">
                <Link href={`/books/details/${b.id}`} className="book-title-link">
                  {b.title}
                </Link>
                <span className="book-author">{b.author}</span>
              </div>
            ))}
          />
          <Column header="ISBN" body={cell((b) => <span className="book-isbn">{b.isbn}</span>)} />
          <Column header="Genre" body={cell((b) => <span className="genre-tag">{formatGenre(b.genre)}</span>)} />
          <Column
            field="price"
            header="Price"
            sortable
            alignHeader="right"
            body={cell((b) => <div className="book-number">{formatPrice(b.price)}</div>)}
          />
          <Column header="Stock" body={cell((b) => <StockTag stock={b.stock} />)} />
          <Column
            field="publishedDate"
            header="Published"
            sortable
            body={cell((b) => <span className="book-isbn">{formatDate(b.publishedDate)}</span>)}
          />

          {/* Row actions */}
          <Column
            header={<span className="p-hidden-accessible">Actions</span>}
            body={cell((b) => (
              <div className="book-row-actions">
                <Button
                  className="icon-button"
                  icon="pi pi-eye"
                  text
                  rounded
                  aria-label={`View ${b.title}`}
                  onClick={() => router.push(`/books/details/${b.id}`)}
                />
                <Button
                  className="icon-button"
                  icon="pi pi-pencil"
                  text
                  rounded
                  aria-label={`Edit ${b.title}`}
                  onClick={() => router.push(`/books/edit/${b.id}`)}
                />
                <Button
                  className="icon-button"
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  aria-label={`Delete ${b.title}`}
                  onClick={() => props.onDelete(b)}
                />
              </div>
            ))}
          />
        </DataTable>
      </div>
    </div>
  );
}
