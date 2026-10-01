import { GENRES, type BookInput } from "@/types/book";
import { toIsoDate } from "./format";

// Validation rules — MUST match backend-go/internal/book/validate.go exactly.
export const BOOK_RULES = {
  TITLE_MIN: 2,
  TITLE_MAX: 200,
  AUTHOR_MIN: 2,
  AUTHOR_MAX: 100,
  ISBN_PATTERN: /^\d{13}$/,
  PRICE_MAX: 10_000_000,
  STOCK_MAX: 100_000,
  DESCRIPTION_MAX: 1000,
} as const;

export type BookFieldErrors = Partial<Record<keyof BookInput, string>>;

/** Same messages as the backend so users see one consistent wording. */
export function validateBook(input: BookInput, today: Date = new Date()): BookFieldErrors {
  const errors: BookFieldErrors = {};
  const r = BOOK_RULES;

  // Title / author: required, trimmed length in range
  const title = input.title.trim();
  if (!title) errors.title = "Title is required";
  else if ([...title].length < r.TITLE_MIN) errors.title = `Title must be at least ${r.TITLE_MIN} characters`;
  else if ([...title].length > r.TITLE_MAX) errors.title = `Title must be at most ${r.TITLE_MAX} characters`;

  const author = input.author.trim();
  if (!author) errors.author = "Author is required";
  else if ([...author].length < r.AUTHOR_MIN) errors.author = `Author must be at least ${r.AUTHOR_MIN} characters`;
  else if ([...author].length > r.AUTHOR_MAX) errors.author = `Author must be at most ${r.AUTHOR_MAX} characters`;

  // ISBN: exactly 13 digits
  const isbn = input.isbn.trim();
  if (!isbn) errors.isbn = "ISBN is required";
  else if (!r.ISBN_PATTERN.test(isbn)) errors.isbn = "ISBN must be exactly 13 digits";

  // Genre: one of the allowed values
  if (!input.genre) errors.genre = "Genre is required";
  else if (!GENRES.includes(input.genre)) errors.genre = "Genre is not valid";

  // Price / stock: required whole numbers in range
  if (input.price === null) errors.price = "Price is required";
  else if (input.price < 0 || input.price > r.PRICE_MAX) errors.price = "Price must be between 0 and 10,000,000";

  if (input.stock === null) errors.stock = "Stock is required";
  else if (input.stock < 0 || input.stock > r.STOCK_MAX) errors.stock = "Stock must be between 0 and 100,000";

  // Published date: required, YYYY-MM-DD, not in the future
  if (!input.publishedDate) errors.publishedDate = "Published date is required";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(input.publishedDate))
    errors.publishedDate = "Published date must be in YYYY-MM-DD format";
  else if (input.publishedDate > toIsoDate(today)) errors.publishedDate = "Published date cannot be in the future";

  // Description: optional, max length
  if ([...input.description.trim()].length > r.DESCRIPTION_MAX)
    errors.description = "Description must be at most 1,000 characters";

  return errors;
}

/** Trims text fields before sending, like the backend does. */
export function toBookPayload(input: BookInput): BookInput {
  return {
    ...input,
    title: input.title.trim(),
    author: input.author.trim(),
    isbn: input.isbn.trim(),
    description: input.description.trim(),
  };
}
