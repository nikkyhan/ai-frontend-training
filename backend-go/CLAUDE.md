# Books API — Backend (Go)

REST API for the Books Admin frontend (`../frontend-next`). Standard library only, in-memory storage
(data resets on restart and is re-seeded with 12 books).

## Commands
go run ./cmd/server          # http://localhost:8080
go test ./... -count=1
go vet ./...
gofmt -l .

Env: PORT (8080), CORS_ORIGIN (comma list; default http://localhost:3000,https://ai-frontend-training.vercel.app), SEED (set "false" to start empty)
Deploy: Render builds the module root (`go build -o app`, start `./app`) — that is why main.go exists at the root.

## Layout
main.go, cmd/server/main.go  entry points (both call internal/app.Run)
internal/app/app.go          wiring: store, routes, middleware
internal/book/model.go       Book, Input, ListQuery
internal/book/validate.go    validation rules — frontend copies them in src/utils/book-rules.ts
internal/book/store.go       thread-safe in-memory repository (filter, sort, page)
internal/book/handler.go     HTTP handlers (Go 1.22 method+path routing)
internal/httpx/              JSON helpers, error shape, CORS, request log

## API contract
Success: {"data": ..., "meta"?: {page, limit, total, totalPages}, "message"?: "..."}
Error:   {"statusCode": 400, "message": "Validation failed", "errors"?: {"field": "message"}}
If you change a rule or field, update the frontend types and book-rules.ts in the same PR.

## Rules
- Company rules are in WM (Work Manual) on Notion — fetch them, don't guess. If this file and WM differ, WM wins.
- Error messages are shown to users as-is: plain English, same wording as the frontend
  (WM | Error Message List). Numbers in messages use the three-digit comma rule ("10,000,000").
- Dates in the API are `YYYY-MM-DD` (WM English short format); the frontend shows them as "October 26, 2015".
- Keep validation and frontend `book-rules.ts` rule-for-rule and message-for-message identical.
