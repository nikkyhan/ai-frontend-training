"use client";

import { useState, type FormEvent } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { GENRES, type Book, type BookInput, type Genre } from "@/types/book";
import { BOOK_RULES, toBookPayload, validateBook, type BookFieldErrors } from "@/utils/book-rules";
import { parseApiError } from "@/utils/api-error";
import { formatGenre, formatNumber, fromIsoDate, toIsoDate } from "@/utils/format";

interface BookFormProps {
  initial?: Book;
  submitLabel: string;
  isSaving: boolean;
  /** Should throw on API error; the form then shows the API's message and keeps the values. */
  onSubmit: (input: BookInput) => Promise<unknown>;
  onCancel: () => void;
}

const EMPTY: BookInput = {
  title: "",
  author: "",
  isbn: "",
  genre: "",
  price: null,
  stock: null,
  publishedDate: "",
  description: "",
};

const GENRE_OPTIONS = GENRES.map((g) => ({ label: formatGenre(g), value: g }));

function toInput(book?: Book): BookInput {
  if (!book) return EMPTY;
  const { title, author, isbn, genre, price, stock, publishedDate, description } = book;
  return { title, author, isbn, genre, price, stock, publishedDate, description };
}

/** Create / edit form. Validation mirrors backend-go exactly (see utils/book-rules.ts). */
export function BookForm({ initial, submitLabel, isSaving, onSubmit, onCancel }: BookFormProps) {
  // ---- Form state ----
  const [values, setValues] = useState<BookInput>(() => toInput(initial));
  const [touched, setTouched] = useState<Partial<Record<keyof BookInput, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<BookFieldErrors>({});
  const [bannerMessage, setBannerMessage] = useState("");

  const clientErrors = validateBook(values);

  /** Error to show for a field: server error first, then client error once touched/submitted. */
  const errorFor = (field: keyof BookInput) =>
    serverErrors[field] ?? (touched[field] || submitted ? clientErrors[field] : undefined);

  const setField = <K extends keyof BookInput>(field: K, value: BookInput[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
    // A server error is about the old value — clear it when the user edits the field
    setServerErrors((errs) => {
      const next = { ...errs };
      delete next[field];
      return next;
    });
  };
  const touch = (field: keyof BookInput) => setTouched((t) => ({ ...t, [field]: true }));

  // ---- Submit ----
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving) return; // no double submit
    setSubmitted(true);
    setBannerMessage("");
    if (Object.keys(clientErrors).length > 0) return;

    try {
      await onSubmit(toBookPayload(values));
    } catch (error) {
      const parsed = parseApiError(error);
      setServerErrors(parsed.fieldErrors as BookFieldErrors);
      setBannerMessage(parsed.message);
    }
  };

  // ---- Field helpers ----
  const fieldProps = (field: keyof BookInput) => {
    const error = errorFor(field);
    return {
      id: `book-${field}`,
      invalid: Boolean(error),
      "aria-invalid": Boolean(error),
      "aria-describedby": error ? `book-${field}-error` : undefined,
    };
  };
  const errorText = (field: keyof BookInput) => {
    const error = errorFor(field);
    return error ? (
      <small id={`book-${field}-error`} className="form-error">
        {error}
      </small>
    ) : null;
  };

  const descriptionLength = [...values.description].length;

  return (
    <form className="content-card" onSubmit={handleSubmit} noValidate aria-label={submitLabel}>
      {/* API error banner */}
      {bannerMessage && (
        <div className="form-banner" role="alert">
          <i className="pi pi-exclamation-circle" aria-hidden="true" />
          <span>{bannerMessage}</span>
        </div>
      )}

      <div className="form-grid">
        {/* Title */}
        <div className="form-field is-full">
          <label htmlFor="book-title" className="form-label">
            Title <span className="form-required">*</span>
          </label>
          <InputText
            {...fieldProps("title")}
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            onBlur={() => touch("title")}
          />
          {errorText("title")}
        </div>

        {/* Author */}
        <div className="form-field">
          <label htmlFor="book-author" className="form-label">
            Author <span className="form-required">*</span>
          </label>
          <InputText
            {...fieldProps("author")}
            value={values.author}
            onChange={(e) => setField("author", e.target.value)}
            onBlur={() => touch("author")}
          />
          {errorText("author")}
        </div>

        {/* ISBN */}
        <div className="form-field">
          <label htmlFor="book-isbn" className="form-label">
            ISBN <span className="form-required">*</span>
          </label>
          <InputText
            {...fieldProps("isbn")}
            value={values.isbn}
            inputMode="numeric"
            placeholder="13 digits, e.g. 9780134190440"
            onChange={(e) => setField("isbn", e.target.value)}
            onBlur={() => touch("isbn")}
          />
          {errorText("isbn")}
        </div>

        {/* Genre */}
        <div className="form-field">
          <label htmlFor="book-genre" className="form-label">
            Genre <span className="form-required">*</span>
          </label>
          <Dropdown
            inputId="book-genre"
            className="book-genre-select"
            invalid={Boolean(errorFor("genre"))}
            aria-describedby={errorFor("genre") ? "book-genre-error" : undefined}
            value={values.genre || null}
            options={GENRE_OPTIONS}
            placeholder="Select a genre"
            onChange={(e) => setField("genre", (e.value as Genre | null) ?? "")}
            onBlur={() => touch("genre")}
          />
          {errorText("genre")}
        </div>

        {/* Published date */}
        <div className="form-field">
          <label htmlFor="book-publishedDate" className="form-label">
            Published date <span className="form-required">*</span>
          </label>
          <Calendar
            inputId="book-publishedDate"
            invalid={Boolean(errorFor("publishedDate"))}
            aria-describedby={errorFor("publishedDate") ? "book-publishedDate-error" : undefined}
            value={fromIsoDate(values.publishedDate)}
            dateFormat="yy-mm-dd"
            placeholder="YYYY-MM-DD"
            maxDate={new Date()}
            showIcon
            showButtonBar
            onChange={(e) => setField("publishedDate", e.value instanceof Date ? toIsoDate(e.value) : "")}
            onBlur={() => touch("publishedDate")}
          />
          {errorText("publishedDate")}
        </div>

        {/* Price */}
        <div className="form-field">
          <label htmlFor="book-price" className="form-label">
            Price (₩) <span className="form-required">*</span>
          </label>
          <InputNumber
            inputId="book-price"
            invalid={Boolean(errorFor("price"))}
            aria-describedby={errorFor("price") ? "book-price-error" : undefined}
            value={values.price}
            min={0}
            max={BOOK_RULES.PRICE_MAX}
            useGrouping
            onValueChange={(e) => setField("price", e.value ?? null)}
            onBlur={() => touch("price")}
          />
          {errorText("price")}
        </div>

        {/* Stock */}
        <div className="form-field">
          <label htmlFor="book-stock" className="form-label">
            Stock <span className="form-required">*</span>
          </label>
          <InputNumber
            inputId="book-stock"
            invalid={Boolean(errorFor("stock"))}
            aria-describedby={errorFor("stock") ? "book-stock-error" : undefined}
            value={values.stock}
            min={0}
            max={BOOK_RULES.STOCK_MAX}
            useGrouping
            onValueChange={(e) => setField("stock", e.value ?? null)}
            onBlur={() => touch("stock")}
          />
          {errorText("stock")}
        </div>

        {/* Description */}
        <div className="form-field is-full">
          <label htmlFor="book-description" className="form-label">
            Description
          </label>
          <InputTextarea
            {...fieldProps("description")}
            value={values.description}
            rows={4}
            autoResize
            onChange={(e) => setField("description", e.target.value)}
            onBlur={() => touch("description")}
          />
          <div className="form-hint">
            {errorText("description") ?? <span>Optional</span>}
            <span>
              {formatNumber(descriptionLength)} / {formatNumber(BOOK_RULES.DESCRIPTION_MAX)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <Button type="button" label="Cancel" outlined onClick={onCancel} disabled={isSaving} />
        <Button type="submit" label={isSaving ? "Saving…" : submitLabel} icon="pi pi-check" loading={isSaving} />
      </div>
    </form>
  );
}
