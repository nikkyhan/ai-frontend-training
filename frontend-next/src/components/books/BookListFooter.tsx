"use client";

import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import { Dropdown } from "primereact/dropdown";
import type { PageMeta } from "@/types/book";
import { formatNumber } from "@/utils/format";

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface BookListFooterProps {
  meta: PageMeta;
  onPageChange: (page: number, limit: number) => void;
}

/** "1–10 of 12 books" · page links · rows per page — the list card's bottom bar. */
export function BookListFooter({ meta, onPageChange }: BookListFooterProps) {
  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="book-list-footer">
      {/* Range */}
      <p className="book-range" aria-live="polite">
        {formatNumber(from)}–{formatNumber(to)} of {formatNumber(meta.total)} {meta.total === 1 ? "book" : "books"}
      </p>

      {/* Page links */}
      <Paginator
        className="book-paginator"
        first={(meta.page - 1) * meta.limit}
        rows={meta.limit}
        totalRecords={meta.total}
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        onPageChange={(e: PaginatorPageChangeEvent) => onPageChange(e.page + 1, e.rows)}
      />

      {/* Page size */}
      <div className="book-rows-per-page">
        <label htmlFor="book-rows-per-page">Rows per page</label>
        <Dropdown
          inputId="book-rows-per-page"
          value={meta.limit}
          options={PAGE_SIZE_OPTIONS}
          onChange={(e) => onPageChange(1, e.value as number)}
        />
      </div>
    </div>
  );
}
