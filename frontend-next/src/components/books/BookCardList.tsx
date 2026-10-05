"use client";

import Link from "next/link";
import type { Book } from "@/types/book";
import { formatDate, formatGenre, formatPrice } from "@/utils/format";
import { BookRowActions } from "./BookRowActions";
import { StockTag } from "./StockTag";

interface BookCardListProps {
  items: Book[];
  onDelete: (book: Book) => void;
}

/** Tablet / mobile view (≤ 1024px): one stacked card per book, as in the Figma design. */
export function BookCardList({ items, onDelete }: BookCardListProps) {
  return (
    <ul className="book-card-list" aria-label="Books">
      {items.map((b) => (
        <li key={b.id} className="book-card">
          {/* Title + author */}
          <Link href={`/books/details/${b.id}`} className="book-title-link">
            {b.title}
          </Link>
          <span className="book-author">{b.author}</span>

          {/* Key facts */}
          <dl className="book-card-meta">
            <div>
              <dt>ISBN</dt>
              <dd className="book-isbn">{b.isbn}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{formatPrice(b.price)}</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>{formatDate(b.publishedDate)}</dd>
            </div>
          </dl>

          {/* Genre + stock badges */}
          <div className="book-card-tags">
            <span className="genre-tag">{formatGenre(b.genre)}</span>
            <span className="book-card-label">Stock</span>
            <StockTag stock={b.stock} />
          </div>

          {/* Actions */}
          <BookRowActions book={b} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
