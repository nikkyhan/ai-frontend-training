"use client";

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { GENRES, type BookSortField, type Genre, type SortOrder } from "@/types/book";
import { formatGenre } from "@/utils/format";

interface BookFiltersProps {
  search: string;
  genre: Genre | "";
  sortBy: BookSortField;
  sortOrder: SortOrder;
  onSearchChange: (value: string) => void;
  onGenreChange: (value: Genre | "") => void;
  onSortChange: (field: BookSortField, order: SortOrder) => void;
  onReset: () => void;
}

const GENRE_OPTIONS = [{ label: "All genres", value: "" }, ...GENRES.map((g) => ({ label: formatGenre(g), value: g }))];

// Card view has no column headers, so sorting is a dropdown there. Value = "field:order".
const SORT_OPTIONS = [
  { label: "Sort by newest", value: "createdAt:desc" },
  { label: "Sort by oldest", value: "createdAt:asc" },
  { label: "Sort by title", value: "title:asc" },
  { label: "Sort by title (Z–A)", value: "title:desc" },
  { label: "Sort by price (low to high)", value: "price:asc" },
  { label: "Sort by price (high to low)", value: "price:desc" },
  { label: "Sort by published (newest)", value: "publishedDate:desc" },
  { label: "Sort by published (oldest)", value: "publishedDate:asc" },
];

/** Toolbar at the top of the list card: search, genre, sort (cards only) and clear. */
export function BookFilters(props: BookFiltersProps) {
  const { search, genre, sortBy, sortOrder, onSearchChange, onGenreChange, onSortChange, onReset } = props;
  const hasFilters = search !== "" || genre !== "";

  return (
    <div className="book-filters" role="search">
      {/* Search by title, author or ISBN */}
      <IconField iconPosition="left" className="book-search">
        <InputIcon className="pi pi-search" />
        <InputText
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search title, author or ISBN"
          aria-label="Search books"
        />
      </IconField>

      {/* Genre filter */}
      <Dropdown
        className="book-genre-filter"
        value={genre}
        options={GENRE_OPTIONS}
        onChange={(e) => onGenreChange((e.value as Genre | null) ?? "")}
        showClear={genre !== ""}
        placeholder="All genres"
        aria-label="Filter by genre"
      />

      {/* Sort — shown only in the card view (≤ 1024px) */}
      <Dropdown
        className="book-sort-filter"
        value={`${sortBy}:${sortOrder}`}
        options={SORT_OPTIONS}
        onChange={(e) => {
          const [field, order] = String(e.value).split(":");
          onSortChange(field as BookSortField, order as SortOrder);
        }}
        aria-label="Sort books"
      />

      {/* Reset */}
      {hasFilters && <Button type="button" className="book-clear-filters" label="Clear filters" link onClick={onReset} />}
    </div>
  );
}
