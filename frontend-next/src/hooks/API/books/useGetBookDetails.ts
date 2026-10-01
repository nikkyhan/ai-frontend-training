import { useQuery } from "@tanstack/react-query";
import { BookService } from "@/api-services/BookService";
import { QUERIES } from "@/utils/api-integration";

/** One book by ID. Disabled until a valid ID is given. */
export function useGetBookDetails(id: number) {
  return useQuery({
    queryKey: [QUERIES.BOOK_DETAILS, id],
    queryFn: () => BookService.getById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
