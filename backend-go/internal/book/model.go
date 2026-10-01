// Package book holds the Book domain: model, validation, storage and HTTP handlers.
package book

import "time"

// Genre values accepted by the API. The frontend mirrors this list.
var Genres = []string{"fiction", "non-fiction", "science", "history", "technology", "children"}

// Book is the stored entity and the JSON shape returned by the API.
type Book struct {
	ID            int64     `json:"id"`
	Title         string    `json:"title"`
	Author        string    `json:"author"`
	ISBN          string    `json:"isbn"`
	Genre         string    `json:"genre"`
	Price         int64     `json:"price"`
	Stock         int64     `json:"stock"`
	PublishedDate string    `json:"publishedDate"` // YYYY-MM-DD
	Description   string    `json:"description"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// Input is the request body for create and update.
// Pointers let validation tell "missing" apart from "zero".
type Input struct {
	Title         *string `json:"title"`
	Author        *string `json:"author"`
	ISBN          *string `json:"isbn"`
	Genre         *string `json:"genre"`
	Price         *int64  `json:"price"`
	Stock         *int64  `json:"stock"`
	PublishedDate *string `json:"publishedDate"`
	Description   *string `json:"description"`
}

// ListQuery is the parsed query string of GET /books.
type ListQuery struct {
	Search    string
	Genre     string
	SortBy    string
	SortOrder string
	Page      int
	Limit     int
}

// ListResult is one page of books plus paging info.
type ListResult struct {
	Items      []Book
	Total      int
	Page       int
	Limit      int
	TotalPages int
}
