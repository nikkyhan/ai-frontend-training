package book

import (
	"regexp"
	"slices"
	"strings"
	"time"
	"unicode/utf8"
)

// Validation limits. Keep in sync with frontend-next/src/utils/book-rules.ts.
const (
	TitleMin       = 2
	TitleMax       = 200
	AuthorMin      = 2
	AuthorMax      = 100
	PriceMax       = 10_000_000
	StockMax       = 100_000
	DescriptionMax = 1000
)

var isbnPattern = regexp.MustCompile(`^\d{13}$`)

// FieldErrors maps a JSON field name to a human-readable message.
type FieldErrors map[string]string

// Validate checks the input and returns a clean Book (without ID/timestamps).
// now is passed in so tests can control "today".
func Validate(in Input, now time.Time) (Book, FieldErrors) {
	errs := FieldErrors{}
	var b Book

	// Text fields: trim, required, length
	b.Title = checkText(errs, "title", "Title", in.Title, TitleMin, TitleMax)
	b.Author = checkText(errs, "author", "Author", in.Author, AuthorMin, AuthorMax)

	// ISBN: exactly 13 digits
	if in.ISBN == nil || strings.TrimSpace(*in.ISBN) == "" {
		errs["isbn"] = "ISBN is required"
	} else if v := strings.TrimSpace(*in.ISBN); !isbnPattern.MatchString(v) {
		errs["isbn"] = "ISBN must be exactly 13 digits"
	} else {
		b.ISBN = v
	}

	// Genre: one of the allowed values
	if in.Genre == nil || *in.Genre == "" {
		errs["genre"] = "Genre is required"
	} else if !slices.Contains(Genres, *in.Genre) {
		errs["genre"] = "Genre is not valid"
	} else {
		b.Genre = *in.Genre
	}

	// Price and stock: whole numbers in range
	if in.Price == nil {
		errs["price"] = "Price is required"
	} else if *in.Price < 0 || *in.Price > PriceMax {
		errs["price"] = "Price must be between 0 and 10,000,000"
	} else {
		b.Price = *in.Price
	}
	if in.Stock == nil {
		errs["stock"] = "Stock is required"
	} else if *in.Stock < 0 || *in.Stock > StockMax {
		errs["stock"] = "Stock must be between 0 and 100,000"
	} else {
		b.Stock = *in.Stock
	}

	// Published date: YYYY-MM-DD and not in the future
	if in.PublishedDate == nil || *in.PublishedDate == "" {
		errs["publishedDate"] = "Published date is required"
	} else if d, err := time.Parse("2006-01-02", *in.PublishedDate); err != nil {
		errs["publishedDate"] = "Published date must be in YYYY-MM-DD format"
	} else if d.After(now) {
		errs["publishedDate"] = "Published date cannot be in the future"
	} else {
		b.PublishedDate = *in.PublishedDate
	}

	// Description: optional, max length
	if in.Description != nil {
		v := strings.TrimSpace(*in.Description)
		if utf8.RuneCountInString(v) > DescriptionMax {
			errs["description"] = "Description must be at most 1,000 characters"
		} else {
			b.Description = v
		}
	}

	if len(errs) > 0 {
		return Book{}, errs
	}
	return b, nil
}

// checkText trims a required text field and checks its length in characters.
func checkText(errs FieldErrors, key, label string, v *string, min, max int) string {
	if v == nil || strings.TrimSpace(*v) == "" {
		errs[key] = label + " is required"
		return ""
	}
	s := strings.TrimSpace(*v)
	n := utf8.RuneCountInString(s)
	if n < min {
		errs[key] = label + " must be at least " + itoa(min) + " characters"
		return ""
	}
	if n > max {
		errs[key] = label + " must be at most " + itoa(max) + " characters"
		return ""
	}
	return s
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var buf [20]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	return string(buf[i:])
}
