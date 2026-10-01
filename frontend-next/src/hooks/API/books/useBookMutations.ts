import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookService } from "@/api-services/BookService";
import { QUERIES } from "@/utils/api-integration";
import type { BookInput } from "@/types/book";

// Create / update / delete. After each success the list (and details) caches are
// invalidated, so every screen refreshes by itself.

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BookInput) => BookService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERIES.BOOKS_LIST] }),
  });
}

export function useUpdateBook(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BookInput) => BookService.update(id, input),
    onSuccess: (res) => {
      queryClient.setQueryData([QUERIES.BOOK_DETAILS, id], res.data);
      return queryClient.invalidateQueries({ queryKey: [QUERIES.BOOKS_LIST] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => BookService.remove(id),
    onSuccess: (_res, id) => {
      queryClient.removeQueries({ queryKey: [QUERIES.BOOK_DETAILS, id] });
      return queryClient.invalidateQueries({ queryKey: [QUERIES.BOOKS_LIST] });
    },
  });
}
