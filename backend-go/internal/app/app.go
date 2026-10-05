// Package app wires storage, routes and middleware and runs the HTTP server.
// Both entry points (./main.go and ./cmd/server) call Run.
package app

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/nikkyhan/ai-frontend-training/backend-go/internal/book"
	"github.com/nikkyhan/ai-frontend-training/backend-go/internal/httpx"
)

// Run starts the Books API and blocks until the server stops.
func Run() {
	port := getenv("PORT", "8080")
	// Local dev + the Vercel demo are allowed by default; CORS_ORIGIN replaces the list
	origin := getenv("CORS_ORIGIN", "http://localhost:3000,https://ai-frontend-training.vercel.app")

	// Storage + sample data
	store := book.NewStore(time.Now)
	if os.Getenv("SEED") != "false" {
		book.Seed(store)
	}

	// Routes
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, _ *http.Request) {
		httpx.JSON(w, http.StatusOK, httpx.Envelope{"status": "ok"})
	})
	book.NewHandler(store).Register(mux)

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           httpx.Logger(httpx.CORS(origin, mux)),
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Printf("Books API listening on http://localhost:%s (CORS origins %s)", port, origin)
	log.Fatal(srv.ListenAndServe())
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
