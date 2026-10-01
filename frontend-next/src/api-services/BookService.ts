import { http } from "@/utils/axios-instance";
import { API_ENDPOINTS, USE_MOCK } from "@/utils/api-integration";
import type { ApiItemResponse, ApiListResponse, ApiMessageResponse } from "@/types/api";
import type { Book, BookInput, BookListParams, BookListResult } from "@/types/book";
import { MockBookService } from "./mock/MockBookService";

// All Book API calls. Each method unwraps the envelope exactly once,
// so screens get plain Book / BookListResult objects (no data.data.data).
const RealBookService = {
  async getList(params: BookListParams): Promise<BookListResult> {
    // Drop empty filters so the URL stays clean
    const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined));
    const res = await http.get<ApiListResponse<Book>>(API_ENDPOINTS.BOOKS, { params: query });
    return { items: res.data.data, meta: res.data.meta };
  },

  async getById(id: number): Promise<Book> {
    const res = await http.get<ApiItemResponse<Book>>(API_ENDPOINTS.BOOK_BY_ID(id));
    return res.data.data;
  },

  async create(input: BookInput): Promise<ApiItemResponse<Book>> {
    const res = await http.post<ApiItemResponse<Book>>(API_ENDPOINTS.BOOKS, input);
    return res.data;
  },

  async update(id: number, input: BookInput): Promise<ApiItemResponse<Book>> {
    const res = await http.put<ApiItemResponse<Book>>(API_ENDPOINTS.BOOK_BY_ID(id), input);
    return res.data;
  },

  async remove(id: number): Promise<ApiMessageResponse> {
    const res = await http.delete<ApiMessageResponse>(API_ENDPOINTS.BOOK_BY_ID(id));
    return res.data;
  },
};

export type BookServiceType = typeof RealBookService;

/** Switch with NEXT_PUBLIC_USE_MOCK — screens and hooks never know which one they use. */
export const BookService: BookServiceType = USE_MOCK ? MockBookService : RealBookService;
