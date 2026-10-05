package book

import "time"

// Seed fills the store with the 12-book sample catalogue used in the Figma design.
// Listed oldest first, so the default "newest first" list matches the design order
// (A Brief History of Time first, The Very Hungry Caterpillar tenth).
func Seed(s *Store) {
	samples := []Book{
		{Title: "Thinking, Fast and Slow", Author: "Daniel Kahneman", ISBN: "9780374533557", Genre: "non-fiction", Price: 19800, Stock: 9, PublishedDate: "2013-04-02"},
		{Title: "Cosmos", Author: "Carl Sagan", ISBN: "9780345539434", Genre: "science", Price: 19000, Stock: 14, PublishedDate: "2013-12-10"},
		{Title: "The Very Hungry Caterpillar", Author: "Eric Carle", ISBN: "9780399226908", Genre: "children", Price: 10500, Stock: 20, PublishedDate: "1994-03-23"},
		{Title: "1984", Author: "George Orwell", ISBN: "9780451524935", Genre: "fiction", Price: 11000, Stock: 30, PublishedDate: "1950-07-01"},
		{Title: "The Pragmatic Programmer", Author: "David Thomas, Andrew Hunt", ISBN: "9780135957059", Genre: "technology", Price: 35000, Stock: 5, PublishedDate: "2019-09-13"},
		{Title: "Sapiens: A Brief History of Humankind", Author: "Yuval Noah Harari", ISBN: "9780062316097", Genre: "non-fiction", Price: 22000, Stock: 0, PublishedDate: "2015-02-10"},
		{Title: "Clean Code", Author: "Robert C. Martin", ISBN: "9780132350884", Genre: "technology", Price: 32000, Stock: 8, PublishedDate: "2008-08-01"},
		{Title: "The Great Gatsby", Author: "F. Scott Fitzgerald", ISBN: "9780743273565", Genre: "fiction", Price: 17000, Stock: 16, PublishedDate: "2013-12-10"},
		{Title: "To Kill a Mockingbird", Author: "Harper Lee", ISBN: "9780061120084", Genre: "fiction", Price: 13200, Stock: 12, PublishedDate: "2006-05-23"},
		{Title: "Guns, Germs, and Steel", Author: "Jared Diamond", ISBN: "9780393354324", Genre: "history", Price: 21000, Stock: 3, PublishedDate: "2017-03-07"},
		{Title: "Where the Wild Things Are", Author: "Maurice Sendak", ISBN: "9780060254926", Genre: "children", Price: 12500, Stock: 25, PublishedDate: "1988-11-09"},
		{Title: "A Brief History of Time", Author: "Stephen Hawking", ISBN: "9780553380163", Genre: "science", Price: 18000, Stock: 18, PublishedDate: "1988-04-01"},
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
