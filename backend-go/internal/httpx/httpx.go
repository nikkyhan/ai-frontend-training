// Package httpx has small JSON and middleware helpers shared by handlers.
package httpx

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"
)

// Envelope is the top-level JSON object of every response.
type Envelope map[string]any

// JSON writes v as JSON with the given status.
func JSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("write json: %v", err)
	}
}

// Error writes the standard error shape: {statusCode, message, errors?}.
func Error(w http.ResponseWriter, status int, message string, fieldErrors map[string]string) {
	body := Envelope{"statusCode": status, "message": message}
	if len(fieldErrors) > 0 {
		body["errors"] = fieldErrors
	}
	JSON(w, status, body)
}

// CORS allows the listed frontend origins to call the API from the browser.
// allowedOrigins is a comma-separated list, e.g. "http://localhost:3000,https://app.vercel.app".
// An entry may contain one "*" to match Vercel's per-deploy and per-branch URLs,
// e.g. "https://my-app-*-my-team.vercel.app" (the "*" never matches "/" or ".").
func CORS(allowedOrigins string, next http.Handler) http.Handler {
	exact := map[string]bool{}
	var patterns [][2]string // prefix, suffix
	for _, o := range strings.Split(allowedOrigins, ",") {
		o = strings.TrimRight(strings.TrimSpace(o), "/")
		if o == "" {
			continue
		}
		if prefix, suffix, ok := strings.Cut(o, "*"); ok {
			patterns = append(patterns, [2]string{prefix, suffix})
		} else {
			exact[o] = true
		}
	}
	allowed := func(origin string) bool {
		if exact[origin] {
			return true
		}
		for _, p := range patterns {
			if len(origin) > len(p[0])+len(p[1]) && strings.HasPrefix(origin, p[0]) && strings.HasSuffix(origin, p[1]) {
				middle := origin[len(p[0]) : len(origin)-len(p[1])]
				if !strings.ContainsAny(middle, "/.:") {
					return true
				}
			}
		}
		return false
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Echo the caller's origin only if it is on the list
		if origin := r.Header.Get("Origin"); origin != "" && allowed(origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Vary", "Origin")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// statusRecorder captures the status code for logging.
type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}

// Logger logs method, path, status and duration of each request.
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, r)
		log.Printf("%s %s %d %s", r.Method, r.URL.RequestURI(), rec.status, time.Since(start).Round(time.Microsecond))
	})
}
