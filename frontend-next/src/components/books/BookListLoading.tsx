import { Skeleton } from "primereact/skeleton";

const SKELETON_ROWS = 5;

/** First-load placeholder inside the list card: grey bars + "Loading books…". */
export function BookListLoading() {
  return (
    <div className="book-list-loading" aria-busy="true">
      {Array.from({ length: SKELETON_ROWS }, (_, i) => (
        <div key={i} className="book-skeleton-row">
          <Skeleton className="book-skeleton-line" />
          <Skeleton className="book-skeleton-line is-short" />
        </div>
      ))}
      <p className="book-loading-text" role="status">
        Loading books…
      </p>
    </div>
  );
}
