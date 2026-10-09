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
npm run test:e2e:mutation  # create/edit/delete tests — local by default; QA may run them on the demo (PLAYWRIGHT_BASE_URL)
node scripts/figma-compare.mjs  # app vs ../figma PNGs → docs/figma-compare (servers must be running)

## Folders
src/app/(main)/books/...        pages: list / create / details/[id] / edit/[id]
src/components/books/           book screens (…View.tsx) and pieces (table, form, filters)
src/components/common/          PageHeader, StateBox, LinkButton
src/components/layout/          AppHeader
src/api-services/               BookService (axios) + mock/MockBookService
src/hooks/API/books/            TanStack Query hooks (useGetBooksList, useGetBookDetails, useBookMutations)
src/utils/                      api-integration (API_ENDPOINTS, QUERIES), format, book-rules, api-error
src/types/                      Book + API envelope types
src/styles/                     WM SCSS structure: _variables, _mixins, _base, _header, _component, _form-element, _button, pages/
e2e/                            Playwright tests (*.mutation.spec.ts = changes data)
docs/                           design check, QA test cases, build report, screenshots, figma-compare
../figma/                       Figma frames (PNG) — the design reference; font is Inter ("Inter var")

## Data flow (controller → service → repository, frontend version)
page.tsx (server) → …View.tsx ("use client") → hook in src/hooks/API → BookService → axios → backend-go.
Services unwrap the `{data, meta}` envelope once. Never read `data.data`.

## Rules
- Follow the style of the file you are editing. Reuse components before making new ones.
- No hardcoded colours or sizes in components — add to `_variables.scss`, use `var(--token)` for theme colours.
- Light theme only (the design has no dark mode). Colour variables: colour + code (`$blue-b1`); ONE theme token per role (`--brand-main`, `--text-sub`, `--border-field`, …).
- Filled buttons use `--brand-main` #2563eb / `--danger-main` #dc2626 with white text (≥ 4.5:1). Never the PrimeReact #3b82f6 / #ef4444.
- Sizes: `$control-sm` 40 (nav links), `$control-md` 44 (pager, icon buttons), `$control-lg` 46 (every field and text button). Spacing on the 4px grid.
- Every required field gets `aria-required`, `aria-invalid` and `aria-describedby` on its focusable input (use `pt` for Dropdown / Calendar / InputNumber).
- Class names: lowercase-with-hyphens. Comment almost every block.
- Validation in `src/utils/book-rules.ts` must match `backend-go/internal/book/validate.go` exactly.
- Dates: WM English format with the full month name, "October 26, 2015" (`formatDate`). Numbers: comma every three digits (`formatNumber`, `formatPrice`).
- Every list/detail screen handles loading, empty and error states.
- PrimeReact's theme is inside a CSS `@layer`: any un-layered rule beats it. Keep global element selectors inside `:where()`.
- Do not render `<link>`/`<script>` in `<head>` from layouts — Next.js owns `<head>` (hydration mismatch).
- Company rules are in WM (Notion). Fetch them, don't guess.
