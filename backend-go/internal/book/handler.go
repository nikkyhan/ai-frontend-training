package book

import (
	"encoding/json"
	"errors"
	"net/http"
	"slices"
	"strconv"

	"github.com/nikkyhan/ai-frontend-training/backend-go/internal/httpx"
)

// Handler exposes the Book REST endpoints.
type Handler struct {
	store *Store
}

// NewHandler creates a handler backed by the given store.
func NewHandler(s *Store) *Handler { return &Handler{store: s} }

// Register mounts the routes on mux under /api/v1.
func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/v1/genres", h.genres)
	mux.HandleFunc("GET /api/v1/books", h.list)
	mux.HandleFunc("POST /api/v1/books", h.create)
	mux.HandleFunc("GET /api/v1/books/{id}", h.get)
	mux.HandleFunc("PUT /api/v1/books/{id}", h.update)
	mux.HandleFunc("DELETE /api/v1/books/{id}", h.delete)
}

func (h *Handler) genres(w http.ResponseWriter, _ *http.Request) {
	httpx.JSON(w, http.StatusOK, httpx.Envelope{"data": Genres})
}

// list handles GET /books?search=&genre=&sortBy=&sortOrder=&page=&limit=
func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	q, errs := parseListQuery(r)
	if errs != nil {
		httpx.Error(w, http.StatusBadRequest, "Invalid query parameters", errs)
		return
	}
	res := h.store.List(q)
	httpx.JSON(w, http.StatusOK, httpx.Envelope{
		"data": res.Items,
		"meta": map[string]int{"page": res.Page, "limit": res.Limit, "total": res.Total, "totalPages": res.TotalPages},
	})
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	b, err := h.store.Get(id)
	if err != nil {
		writeStoreError(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.Envelope{"data": b})
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	b, ok := h.decodeAndValidate(w, r)
	if !ok {
		return
	}
	created, err := h.store.Create(b)
	if err != nil {
		writeStoreError(w, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, httpx.Envelope{"data": created, "message": "Book created successfully"})
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	b, ok := h.decodeAndValidate(w, r)
	if !ok {
		return
	}
	updated, err := h.store.Update(id, b)
	if err != nil {
		writeStoreError(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.Envelope{"data": updated, "message": "Book updated successfully"})
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	if err := h.store.Delete(id); err != nil {
		writeStoreError(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.Envelope{"message": "Book deleted successfully"})
}

// decodeAndValidate reads the JSON body and runs validation, writing a 400 on failure.
func (h *Handler) decodeAndValidate(w http.ResponseWriter, r *http.Request) (Book, bool) {
	var in Input
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&in); err != nil {
		httpx.Error(w, http.StatusBadRequest, "Request body is not valid JSON", nil)
		return Book{}, false
	}
	b, errs := Validate(in, h.store.now())
	if errs != nil {
		httpx.Error(w, http.StatusBadRequest, "Validation failed", errs)
		return Book{}, false
	}
	return b, true
}

// writeStoreError maps store errors to HTTP responses.
func writeStoreError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		httpx.Error(w, http.StatusNotFound, "Book not found", nil)
	case errors.Is(err, ErrDuplicateISBN):
		httpx.Error(w, http.StatusConflict, "A book with this ISBN already exists", map[string]string{"isbn": "This ISBN is already used by another book"})
	default:
		httpx.Error(w, http.StatusInternalServerError, "Something went wrong", nil)
	}
}

func pathID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id < 1 {
		httpx.Error(w, http.StatusBadRequest, "Book ID must be a positive number", nil)
		return 0, false
	}
	return id, true
}

var sortFields = []string{"createdAt", "title", "price", "publishedDate"}

// parseListQuery reads and validates list query parameters, applying defaults.
func parseListQuery(r *http.Request) (ListQuery, map[string]string) {
	v := r.URL.Query()
	q := ListQuery{Search: v.Get("search"), Genre: v.Get("genre"), SortBy: "createdAt", SortOrder: "desc", Page: 1, Limit: 10}
	errs := map[string]string{}

	if q.Genre != "" && !slices.Contains(Genres, q.Genre) {
		errs["genre"] = "Genre is not valid"
	}
	if s := v.Get("sortBy"); s != "" {
		if !slices.Contains(sortFields, s) {
			errs["sortBy"] = "sortBy must be one of createdAt, title, price, publishedDate"
		}
		q.SortBy = s
	}
	if s := v.Get("sortOrder"); s != "" {
		if s != "asc" && s != "desc" {
			errs["sortOrder"] = "sortOrder must be asc or desc"
		}
		q.SortOrder = s
	}
	if s := v.Get("page"); s != "" {
		n, err := strconv.Atoi(s)
		if err != nil || n < 1 {
			errs["page"] = "page must be a positive number"
		}
		q.Page = n
	}
	if s := v.Get("limit"); s != "" {
		n, err := strconv.Atoi(s)
		if err != nil || n < 1 || n > 100 {
			errs["limit"] = "limit must be between 1 and 100"
		}
		q.Limit = n
	}
	if len(errs) > 0 {
		return q, errs
	}
	return q, nil
}
