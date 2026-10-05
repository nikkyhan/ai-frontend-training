// Root entry point so hosts that build the module root (Render's default
// `go build -o app` + `./app`) work without custom commands.
// Locally you can use either `go run .` or `go run ./cmd/server`.
package main

import "github.com/nikkyhan/ai-frontend-training/backend-go/internal/app"

func main() {
	app.Run()
}
