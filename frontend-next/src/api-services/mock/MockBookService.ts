import type { ApiItemResponse, ApiMessageResponse } from "@/types/api";
import type { Book, BookInput, BookListParams, BookListResult, Genre } from "@/types/book";
import { MockApiError } from "@/utils/api-error";
import { validateBook } from "@/utils/book-rules";
import { MOCK_BOOKS } from "./mock-books";

// In-memory fake of backend-go. Same filtering, sorting, paging and errors,
// with a short delay so the loading state is visible.
const DELAY_MS = 600;
let books: Book[] = MOCK_BOOKS.map((b) => ({ ...b }));
let nextId = books.length + 1;

const wait = () => new Promise((resolve) => setTimeout(resolve, DELAY_MS));

function toBook(input: BookInput): Omit<Book, "id" | "createdAt" | "updatedAt"> {
  const errors = validateBook(input);
  if (Object.keys(errors).length > 0) throw new MockApiError(400, "Validation failed", errors as Record<string, string>);
  return {
    title: input.title.trim(),
    author: input.author.trim(),
    isbn: input.isbn.trim(),
    genre: input.genre as Genre,
    price: input.price ?? 0,
    stock: input.stock ?? 0,
    publishedDate: input.publishedDate,
    description: input.description.trim(),
  };
}

function assertIsbnFree(isbn: string, exceptId = 0) {
  if (books.some((b) => b.isbn === isbn && b.id !== exceptId)) {
    throw new MockApiError(409, "A book with this ISBN already exists", { isbn: "This ISBN is already used by another book" });
  }
}

export const MockBookService = {
  async getList(params: BookListParams): Promise<BookListResult> {
    await wait();
    const search = (params.search ?? "").trim().toLowerCase();
    const sortBy = params.sortBy ?? "createdAt";
    const dir = params.sortOrder === "asc" ? 1 : -1;

    // Filter
    const filtered = books.filter(
      (b) =>
        (!params.genre || b.genre === params.genre) &&
        (!search ||
          b.title.toLowerCase().includes(search) ||
          b.author.toLowerCase().includes(search) ||
          b.isbn.includes(search)),
    );

    // Sort (ID as tie-breaker)
    filtered.sort((a, b) => {
      const av = sortBy === "title" ? a.title.toLowerCase() : a[sortBy];
      const bv = sortBy === "title" ? b.title.toLowerCase() : b[sortBy];
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return (a.id - b.id) * dir;
    });

    // Page
    const start = (params.page - 1) * params.limit;
    return {
      items: filtered.slice(start, start + params.limit),
      meta: {
        page: params.page,
        limit: params.limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / params.limit),
      },
    };
  },

  async getById(id: number): Promise<Book> {
    await wait();
    const book = books.find((b) => b.id === id);
    if (!book) throw new MockApiError(404, "Book not found");
    return { ...book };
  },

  async create(input: BookInput): Promise<ApiItemResponse<Book>> {
    await wait();
    const data = toBook(input);
    assertIsbnFree(data.isbn);
    const now = new Date().toISOString();
    const book: Book = { ...data, id: nextId++, createdAt: now, updatedAt: now };
    books = [...books, book];
    return { data: book, message: "Book created successfully" };
  },

  async update(id: number, input: BookInput): Promise<ApiItemResponse<Book>> {
    await wait();
    const old = books.find((b) => b.id === id);
    if (!old) throw new MockApiError(404, "Book not found");
    const data = toBook(input);
    assertIsbnFree(data.isbn, id);
    const book: Book = { ...old, ...data, updatedAt: new Date().toISOString() };
    books = books.map((b) => (b.id === id ? book : b));
    return { data: book, message: "Book updated successfully" };
  },

  async remove(id: number): Promise<ApiMessageResponse> {
    await wait();
    if (!books.some((b) => b.id === id)) throw new MockApiError(404, "Book not found");
    books = books.filter((b) => b.id !== id);
    return { message: "Book deleted successfully" };
  },
};
