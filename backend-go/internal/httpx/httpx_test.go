package httpx

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCORSAllowList(t *testing.T) {
	ok := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })
	h := CORS("http://localhost:3000, https://app.vercel.app/", ok)

	cases := []struct {
		origin, want string
	}{
		{"http://localhost:3000", "http://localhost:3000"},
		{"https://app.vercel.app", "https://app.vercel.app"}, // trailing slash in config is ignored
		{"https://evil.example", ""},
		{"", ""},
	}
	for _, c := range cases {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		if c.origin != "" {
			req.Header.Set("Origin", c.origin)
		}
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if got := rec.Header().Get("Access-Control-Allow-Origin"); got != c.want {
			t.Errorf("origin %q: allow-origin = %q, want %q", c.origin, got, c.want)
		}
	}

	// Wildcard entry: Vercel branch / deploy URLs of one project only
	hw := CORS("https://app-*-team.vercel.app", ok)
	wild := []struct {
		origin string
		want   bool
	}{
		{"https://app-git-main-team.vercel.app", true},
		{"https://app-abc123-team.vercel.app", true},
		{"https://app--team.vercel.app", false},           // "*" must match at least one character
		{"https://app-team.vercel.app", false},            // nothing for "*"
		{"https://app-x.evil.com-team.vercel.app", false}, // "*" must not span a "."
		{"https://other-git-main-team.vercel.app", false},
		{"http://app-git-main-team.vercel.app", false}, // wrong scheme
	}
	for _, c := range wild {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Origin", c.origin)
		rec := httptest.NewRecorder()
		hw.ServeHTTP(rec, req)
		got := rec.Header().Get("Access-Control-Allow-Origin") == c.origin
		if got != c.want {
			t.Errorf("wildcard origin %q: allowed = %v, want %v", c.origin, got, c.want)
		}
	}

	// Preflight answers 204 without calling the handler
	req := httptest.NewRequest(http.MethodOptions, "/", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != http.StatusNoContent {
		t.Errorf("preflight status = %d, want 204", rec.Code)
	}
}
