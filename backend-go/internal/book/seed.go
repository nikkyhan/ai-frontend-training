package book

import "time"

// Seed fills the store with sample books so the list has data on first run.
func Seed(s *Store) {
	samples := []Book{
		{Title: "The Go Programming Language", Author: "Alan Donovan", ISBN: "9780134190440", Genre: "technology", Price: 42000, Stock: 12, PublishedDate: "2015-10-26", Description: "A complete guide to Go."},
		{Title: "Clean Code", Author: "Robert C. Martin", ISBN: "9780132350884", Genre: "technology", Price: 38500, Stock: 0, PublishedDate: "2008-08-01"},
		{Title: "Sapiens", Author: "Yuval Noah Harari", ISBN: "9780062316097", Genre: "history", Price: 22000, Stock: 30, PublishedDate: "2015-02-10"},
		{Title: "A Brief History of Time", Author: "Stephen Hawking", ISBN: "9780553380163", Genre: "science", Price: 18000, Stock: 7, PublishedDate: "1998-09-01"},
		{Title: "The Little Prince", Author: "Antoine de Saint-Exupery", ISBN: "9780156012195", Genre: "children", Price: 9900, Stock: 54, PublishedDate: "2000-05-15"},
		{Title: "1984", Author: "George Orwell", ISBN: "9780451524935", Genre: "fiction", Price: 11500, Stock: 21, PublishedDate: "1961-01-01"},
		{Title: "Thinking, Fast and Slow", Author: "Daniel Kahneman", ISBN: "9780374533557", Genre: "non-fiction", Price: 19800, Stock: 9, PublishedDate: "2013-04-02"},
		{Title: "The Pragmatic Programmer", Author: "David Thomas", ISBN: "9780135957059", Genre: "technology", Price: 45000, Stock: 5, PublishedDate: "2019-09-13"},
		{Title: "Cosmos", Author: "Carl Sagan", ISBN: "9780345539434", Genre: "science", Price: 17000, Stock: 14, PublishedDate: "2013-12-10"},
		{Title: "To Kill a Mockingbird", Author: "Harper Lee", ISBN: "9780061120084", Genre: "fiction", Price: 13200, Stock: 18, PublishedDate: "2006-05-23"},
		{Title: "Guns, Germs, and Steel", Author: "Jared Diamond", ISBN: "9780393354324", Genre: "history", Price: 21000, Stock: 3, PublishedDate: "2017-03-07"},
		{Title: "Where the Wild Things Are", Author: "Maurice Sendak", ISBN: "9780060254926", Genre: "children", Price: 12500, Stock: 25, PublishedDate: "1988-11-09"},
	}
	// Give each seed book a distinct created time so default sort is stable
	base := s.now().Add(-time.Duration(len(samples)) * time.Hour)
	for i, b := range samples {
		ts := base.Add(time.Duration(i) * time.Hour)
		s.mu.Lock()
		b.ID, b.CreatedAt, b.UpdatedAt = s.nextID, ts, ts
		s.books[b.ID] = b
		s.nextID++
		s.mu.Unlock()
	}
}
