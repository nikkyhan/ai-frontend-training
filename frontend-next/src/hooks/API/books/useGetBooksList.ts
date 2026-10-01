import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BookService } from "@/api-services/BookService";
import { QUERIES } from "@/utils/api-integration";
import type { BookListParams } from "@/types/book";

/**
 * Book list with search, genre filter, sort and paging.
 * The params object is part of the query key, so changing any of them refetches.
 * keepPreviousData keeps the old rows on screen while the next page loads.
 */
export function useGetBooksList(params: BookListParams) {
  return useQuery({
    queryKey: [QUERIES.BOOKS_LIST, params],
    queryFn: () => BookService.getList(params),
    placeholderData: keepPreviousData,
  });
}
