package book

import (
	"errors"
	"sort"
	"strings"
	"sync"
	"time"
)

var (
	ErrNotFound      = errors.New("book not found")
	ErrDuplicateISBN = errors.New("a book with this ISBN already exists")
)

// Store is a thread-safe in-memory book repository.
// Data resets when the server restarts, which keeps demos and e2e runs predictable.
type Store struct {
	mu     sync.RWMutex
	books  map[int64]Book
	nextID int64
	now    func() time.Time
}

// NewStore creates an empty store.
func NewStore(now func() time.Time) *Store {
	return &Store{books: map[int64]Book{}, nextID: 1, now: now}
}

// List filters, sorts and paginates books.
func (s *Store) List(q ListQuery) ListResult {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Filter by search text (title, author, ISBN) and genre
	search := strings.ToLower(strings.TrimSpace(q.Search))
	items := make([]Book, 0, len(s.books))
	for _, b := range s.books {
		if q.Genre != "" && b.Genre != q.Genre {
			continue
		}
		if search != "" &&
			!strings.Contains(strings.ToLower(b.Title), search) &&
			!strings.Contains(strings.ToLower(b.Author), search) &&
			!strings.Contains(b.ISBN, search) {
			continue
		}
		items = append(items, b)
	}

	// Sort; ID is the tie-breaker so paging is stable
	less := sortFunc(q.SortBy)
	sort.Slice(items, func(i, j int) bool {
		a, b := items[i], items[j]
		if q.SortOrder == "asc" {
			a, b = b, a
		}
		if r := less(a, b); r != 0 {
			return r > 0
		}
		return a.ID > b.ID
	})

	// Paginate
	total := len(items)
	totalPages := (total + q.Limit - 1) / q.Limit
	start := min((q.Page-1)*q.Limit, total)
	end := min(start+q.Limit, total)

	return ListResult{Items: items[start:end], Total: total, Page: q.Page, Limit: q.Limit, TotalPages: totalPages}
}

// sortFunc returns a comparator: >0 when a should come first in descending order.
func sortFunc(field string) func(a, b Book) int {
	switch field {
	case "title":
		return func(a, b Book) int { return strings.Compare(strings.ToLower(a.Title), strings.ToLower(b.Title)) }
	case "price":
		return func(a, b Book) int { return cmp64(a.Price, b.Price) }
	case "publishedDate":
		return func(a, b Book) int { return strings.Compare(a.PublishedDate, b.PublishedDate) }
	default: // createdAt
		return func(a, b Book) int { return a.CreatedAt.Compare(b.CreatedAt) }
	}
}

func cmp64(a, b int64) int {
	switch {
	case a > b:
		return 1
	case a < b:
		return -1
	}
	return 0
}

// Get returns one book by ID.
func (s *Store) Get(id int64) (Book, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	b, ok := s.books[id]
	if !ok {
		return Book{}, ErrNotFound
	}
	return b, nil
}

// Create stores a validated book and assigns ID and timestamps.
func (s *Store) Create(b Book) (Book, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.isbnTaken(b.ISBN, 0) {
		return Book{}, ErrDuplicateISBN
	}
	now := s.now()
	b.ID = s.nextID
	b.CreatedAt, b.UpdatedAt = now, now
	s.books[b.ID] = b
	s.nextID++
	return b, nil
}

// Update replaces the editable fields of an existing book.
func (s *Store) Update(id int64, b Book) (Book, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	old, ok := s.books[id]
	if !ok {
		return Book{}, ErrNotFound
	}
	if s.isbnTaken(b.ISBN, id) {
		return Book{}, ErrDuplicateISBN
	}
	b.ID, b.CreatedAt, b.UpdatedAt = id, old.CreatedAt, s.now()
	s.books[id] = b
	return b, nil
}

// Delete removes a book.
func (s *Store) Delete(id int64) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.books[id]; !ok {
		return ErrNotFound
	}
	delete(s.books, id)
	return nil
}

// isbnTaken reports whether another book (not exceptID) uses this ISBN. Caller holds the lock.
func (s *Store) isbnTaken(isbn string, exceptID int64) bool {
	for _, b := range s.books {
		if b.ISBN == isbn && b.ID != exceptID {
			return true
		}
	}
	return false
}
