# Books API — Backend (Go)

REST API for the Books Admin frontend (`../frontend-next`). Standard library only, in-memory storage
(data resets on restart and is re-seeded with 12 books).

## Commands
go run ./cmd/server          # http://localhost:8080
go test ./... -count=1
go vet ./...
gofmt -l .

Env: PORT (8080), CORS_ORIGIN (http://localhost:3000), SEED (set "false" to start empty)

## Layout
cmd/server/main.go           wiring: store, routes, middleware
internal/book/model.go       Book, Input, ListQuery
internal/book/validate.go    validation rules — frontend copies them in src/utils/book-rules.ts
internal/book/store.go       thread-safe in-memory repository (filter, sort, page)
internal/book/handler.go     HTTP handlers (Go 1.22 method+path routing)
internal/httpx/              JSON helpers, error shape, CORS, request log

## API contract
Success: {"data": ..., "meta"?: {page, limit, total, totalPages}, "message"?: "..."}
Error:   {"statusCode": 400, "message": "Validation failed", "errors"?: {"field": "message"}}
If you change a rule or field, update the frontend types and book-rules.ts in the same PR.
