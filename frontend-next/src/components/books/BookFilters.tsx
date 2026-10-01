"use client";

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { GENRES, type Genre } from "@/types/book";
import { formatGenre } from "@/utils/format";

interface BookFiltersProps {
  search: string;
  genre: Genre | "";
  onSearchChange: (value: string) => void;
  onGenreChange: (value: Genre | "") => void;
  onReset: () => void;
}

const GENRE_OPTIONS = GENRES.map((g) => ({ label: formatGenre(g), value: g }));

/** Search box + genre dropdown above the book table. Controlled by the list page. */
export function BookFilters({ search, genre, onSearchChange, onGenreChange, onReset }: BookFiltersProps) {
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
        value={genre || null}
        options={GENRE_OPTIONS}
        onChange={(e) => onGenreChange((e.value as Genre | null) ?? "")}
        placeholder="All genres"
        showClear
        aria-label="Filter by genre"
      />

      {/* Reset */}
      {hasFilters && <Button type="button" label="Clear filters" icon="pi pi-filter-slash" text onClick={onReset} />}
    </div>
  );
}
