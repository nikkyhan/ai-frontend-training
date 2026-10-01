package book

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

var fixedNow = time.Date(2026, 10, 1, 12, 0, 0, 0, time.UTC)

func newTestServer() *http.ServeMux {
	s := NewStore(func() time.Time { return fixedNow })
	Seed(s)
	mux := http.NewServeMux()
	NewHandler(s).Register(mux)
	return mux
}

func do(t *testing.T, mux http.Handler, method, path, body string) (int, map[string]any) {
	t.Helper()
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	var out map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("invalid json %q: %v", rec.Body.String(), err)
	}
	return rec.Code, out
}

const validBody = `{"title":"New Book","author":"Some Author","isbn":"1234567890123","genre":"fiction","price":15000,"stock":3,"publishedDate":"2020-01-01","description":"x"}`

func TestListDefaultsAndPaging(t *testing.T) {
	mux := newTestServer()
	code, out := do(t, mux, "GET", "/api/v1/books?limit=5&page=3", "")
	if code != 200 {
		t.Fatalf("status %d", code)
	}
	meta := out["meta"].(map[string]any)
	if meta["total"].(float64) != 12 || meta["totalPages"].(float64) != 3 {
		t.Fatalf("meta %v", meta)
	}
	if n := len(out["data"].([]any)); n != 2 {
		t.Fatalf("page 3 len = %d, want 2", n)
	}
}

func TestListSearchAndGenre(t *testing.T) {
	mux := newTestServer()
	_, out := do(t, mux, "GET", "/api/v1/books?search=orwell", "")
	if n := len(out["data"].([]any)); n != 1 {
		t.Fatalf("search len = %d", n)
	}
	_, out = do(t, mux, "GET", "/api/v1/books?genre=technology", "")
	if n := len(out["data"].([]any)); n != 3 {
		t.Fatalf("genre len = %d", n)
	}
	_, out = do(t, mux, "GET", "/api/v1/books?search=zzzz", "")
	if n := len(out["data"].([]any)); n != 0 {
		t.Fatalf("empty search len = %d", n)
	}
}

func TestListSort(t *testing.T) {
	mux := newTestServer()
	_, out := do(t, mux, "GET", "/api/v1/books?sortBy=price&sortOrder=asc&limit=1", "")
	first := out["data"].([]any)[0].(map[string]any)
	if first["price"].(float64) != 9900 {
		t.Fatalf("cheapest = %v", first["price"])
	}
}

func TestListBadQuery(t *testing.T) {
	code, out := do(t, newTestServer(), "GET", "/api/v1/books?limit=500&genre=x", "")
	if code != 400 {
		t.Fatalf("status %d", code)
	}
	errs := out["errors"].(map[string]any)
	if errs["limit"] == nil || errs["genre"] == nil {
		t.Fatalf("errors %v", errs)
	}
}

func TestCRUD(t *testing.T) {
	mux := newTestServer()

	code, out := do(t, mux, "POST", "/api/v1/books", validBody)
	if code != 201 {
		t.Fatalf("create status %d %v", code, out)
	}
	id := int(out["data"].(map[string]any)["id"].(float64))
	path := "/api/v1/books/" + itoa(id)

	code, out = do(t, mux, "GET", path, "")
	if code != 200 || out["data"].(map[string]any)["title"] != "New Book" {
		t.Fatalf("get %d %v", code, out)
	}

	updated := strings.Replace(validBody, "New Book", "Renamed", 1)
	code, out = do(t, mux, "PUT", path, updated)
	if code != 200 || out["data"].(map[string]any)["title"] != "Renamed" {
		t.Fatalf("update %d %v", code, out)
	}

	if code, _ = do(t, mux, "DELETE", path, ""); code != 200 {
		t.Fatalf("delete %d", code)
	}
	if code, _ = do(t, mux, "GET", path, ""); code != 404 {
		t.Fatalf("get after delete %d", code)
	}
}

func TestCreateValidation(t *testing.T) {
	mux := newTestServer()
	body := `{"title":" ","author":"A","isbn":"123","genre":"poetry","price":-1,"stock":100001,"publishedDate":"2099-01-01"}`
	code, out := do(t, mux, "POST", "/api/v1/books", body)
	if code != 400 {
		t.Fatalf("status %d", code)
	}
	errs := out["errors"].(map[string]any)
	for _, f := range []string{"title", "author", "isbn", "genre", "price", "stock", "publishedDate"} {
		if errs[f] == nil {
			t.Errorf("missing error for %s: %v", f, errs)
		}
	}
}

func TestCreateDuplicateISBN(t *testing.T) {
	mux := newTestServer()
	body := strings.Replace(validBody, "1234567890123", "9780451524935", 1)
	code, out := do(t, mux, "POST", "/api/v1/books", body)
	if code != 409 || out["errors"].(map[string]any)["isbn"] == nil {
		t.Fatalf("dup isbn %d %v", code, out)
	}
}

func TestBadIDAndBody(t *testing.T) {
	mux := newTestServer()
	if code, _ := do(t, mux, "GET", "/api/v1/books/abc", ""); code != 400 {
		t.Fatalf("bad id %d", code)
	}
	if code, _ := do(t, mux, "POST", "/api/v1/books", "{"); code != 400 {
		t.Fatalf("bad body %d", code)
	}
	if code, _ := do(t, mux, "PUT", "/api/v1/books/999", validBody); code != 404 {
		t.Fatalf("update missing %d", code)
	}
}
