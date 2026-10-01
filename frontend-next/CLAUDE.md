# Books Admin — Frontend

Admin screen for a book catalogue: staff search, filter, add, edit and delete books.
Built for the TL AI Frontend Training (Homework 1 + 2). Talks to `../backend-go`.

Stack: Next.js 15 (App Router) · React 19 · TypeScript · PrimeReact 10 · SCSS · TanStack Query 5 · axios · Playwright
Backend API: `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080/api/v1`)
Mock mode: `NEXT_PUBLIC_USE_MOCK=true` → in-memory data, no backend needed (Homework 1)

## Commands
npm run dev                # start the app on localhost:3000
npx tsc --noEmit           # type-check — run after every change
npm run lint
npm run build              # stop `npm run dev` first (both use .next/)
npm run test:e2e           # Playwright (starts backend + dev server if not running)
npm run test:e2e:ui        # visual test runner
npm run test:e2e:mutation  # create/edit/delete tests — local only

## Folders
src/app/(main)/books/...        pages: list / create / details/[id] / edit/[id]
src/components/books/           book screens (…View.tsx) and pieces (table, form, filters)
src/components/common/          PageHeader, StateBox, LinkButton
src/components/layout/          AppHeader, ThemeToggle, theme helpers
src/api-services/               BookService (axios) + mock/MockBookService
src/hooks/API/books/            TanStack Query hooks (useGetBooksList, useGetBookDetails, useBookMutations)
src/utils/                      api-integration (API_ENDPOINTS, QUERIES), format, book-rules, api-error
src/types/                      Book + API envelope types
src/styles/                     WM SCSS structure: _variables, _mixins, _base, _header, _component, _form-element, _button, pages/
e2e/                            Playwright tests (*.mutation.spec.ts = changes data)
docs/                           design check, QA test cases, build report, screenshots

## Data flow (controller → service → repository, frontend version)
page.tsx (server) → …View.tsx ("use client") → hook in src/hooks/API → BookService → axios → backend-go.
Services unwrap the `{data, meta}` envelope once. Never read `data.data`.

## Rules
- Follow the style of the file you are editing. Reuse components before making new ones.
- No hardcoded colours or sizes in components — add to `_variables.scss`, use `var(--token)` for theme colours.
- Colour variables: colour + code (`$blue-b1`). Every light token has a dark token with the same name.
- Class names: lowercase-with-hyphens. Comment almost every block.
- Validation in `src/utils/book-rules.ts` must match `backend-go/internal/book/validate.go` exactly.
- Dates: "Oct 26, 2015" (`formatDate`). Numbers: comma every three digits (`formatNumber`, `formatPrice`).
- Every list/detail screen handles loading, empty and error states.
- PrimeReact's theme is inside a CSS `@layer`: any un-layered rule beats it. Keep global element selectors inside `:where()`.
- Do not render `<link>`/`<script>` in `<head>` from layouts — Next.js owns `<head>` (hydration mismatch).
- Company rules are in WM (Notion). Fetch them, don't guess.
