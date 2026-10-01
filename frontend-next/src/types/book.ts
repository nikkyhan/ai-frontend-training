// Types mirror the JSON returned by backend-go (internal/book/model.go).

export const GENRES = ["fiction", "non-fiction", "science", "history", "technology", "children"] as const;
export type Genre = (typeof GENRES)[number];

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  genre: Genre;
  price: number;
  stock: number;
  publishedDate: string; // YYYY-MM-DD
  description: string;
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

/** Body for POST /books and PUT /books/{id}. */
export interface BookInput {
  title: string;
  author: string;
  isbn: string;
  genre: Genre | "";
  price: number | null;
  stock: number | null;
  publishedDate: string;
  description: string;
}

export type BookSortField = "createdAt" | "title" | "price" | "publishedDate";
export type SortOrder = "asc" | "desc";

/** Query params for GET /books. */
export interface BookListParams {
  search?: string;
  genre?: Genre | "";
  sortBy?: BookSortField;
  sortOrder?: SortOrder;
  page: number;
  limit: number;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BookListResult {
  items: Book[];
  meta: PageMeta;
}
