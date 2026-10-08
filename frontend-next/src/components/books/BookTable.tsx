"use client";

import Link from "next/link";
import { DataTable, type DataTableSortEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import type { Book, BookSortField, SortOrder } from "@/types/book";
import { formatDate, formatGenre, formatPrice } from "@/utils/format";
import { BookRowActions } from "./BookRowActions";
import { StockTag } from "./StockTag";

interface BookTableProps {
  items: Book[];
  isFetching: boolean;
  sortBy: BookSortField;
  sortOrder: SortOrder;
  onSortChange: (field: BookSortField, order: SortOrder) => void;
  onDelete: (book: Book) => void;
}

/** Desktop view (≥ 1025px): server-sorted table. Paging lives in BookListFooter. */
export function BookTable({ items, isFetching, sortBy, sortOrder, onSortChange, onDelete }: BookTableProps) {
  const handleSort = (e: DataTableSortEvent) =>
    onSortChange((e.sortField as BookSortField) ?? "createdAt", e.sortOrder === 1 ? "asc" : "desc");

  return (
    <div className="book-table-scroll">
      <DataTable
        value={items}
        dataKey="id"
        lazy
        sortField={sortBy === "createdAt" ? undefined : sortBy}
        sortOrder={sortOrder === "asc" ? 1 : -1}
        onSort={handleSort}
        loading={isFetching}
        aria-busy={isFetching}
        aria-label="Books"
      >
        {/* Title + author */}
        <Column
          field="title"
          header="Title"
          headerClassName="col-title"
          sortable
          body={(b: Book) => (
            <div className="book-title-cell">
              <Link href={`/books/details/${b.id}`} className="book-title-link">
                {b.title}
              </Link>
              <span className="book-author">{b.author}</span>
            </div>
          )}
        />
        <Column header="ISBN" headerClassName="col-isbn" body={(b: Book) => <span className="book-isbn">{b.isbn}</span>} />
        <Column header="Genre" headerClassName="col-genre" body={(b: Book) => <span className="genre-tag">{formatGenre(b.genre)}</span>} />
        <Column
          field="price"
          header="Price"
          headerClassName="col-price"
          sortable
          body={(b: Book) => <span className="book-number">{formatPrice(b.price)}</span>}
        />
        <Column header="Stock" headerClassName="col-stock" body={(b: Book) => <StockTag stock={b.stock} />} />
        <Column
          field="publishedDate"
          header="Published"
          headerClassName="col-published"
          sortable
          body={(b: Book) => <span className="book-date">{formatDate(b.publishedDate)}</span>}
        />

        {/* Row actions */}
        <Column
          header={<span className="p-hidden-accessible">Actions</span>}
          body={(b: Book) => <BookRowActions book={b} onDelete={onDelete} />}
        />
      </DataTable>
    </div>
  );
}
