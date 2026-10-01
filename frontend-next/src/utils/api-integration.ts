// Single place for endpoint paths and TanStack Query keys.

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

/** true = in-memory mock data (Homework 1); false = real Go API. */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const API_ENDPOINTS = {
  BOOKS: "/books",
  BOOK_BY_ID: (id: number) => `/books/${id}`,
} as const;

export const QUERIES = {
  BOOKS_LIST: "books-list",
  BOOK_DETAILS: "book-details",
} as const;
