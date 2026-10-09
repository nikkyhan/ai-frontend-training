# AI Frontend Training — Books Admin

Homework 1 + Homework 2 for **TL | AI Frontend Training — Building Frontend with Claude Code
(for Backend Developers)**: a full Books feature (list, create, details, edit, delete) with a
Go REST API and a Next.js frontend.

```
ai-frontend-training/
├── backend-go/      Go 1.22+ REST API (standard library only, in-memory data)
├── figma/           Figma export: comparison boards (1440 / 768 / 375, light) + audit and states specifications
└── frontend-next/   Next.js 15 · React 19 · TypeScript · PrimeReact 10 · SCSS · TanStack Query · Playwright
```

## What I built
| Homework | What | Where |
|----------|------|-------|
| 1 — screen from a design | Book list with loading / empty / filled states using **mock data**, WM SCSS structure and naming, one token per role (light theme only), checked at 11 widths | `NEXT_PUBLIC_USE_MOCK=true`, `docs/design-check.md`, `docs/screenshots/` |
| 2 — full feature with real API | List with search, genre filter, sort and paging; create/edit forms with validation equal to the backend; details; delete with confirm; API error messages shown; WM date/number formats; QA cases; Playwright tests; QA build report | `backend-go/`, `frontend-next/src/`, `frontend-next/e2e/`, `frontend-next/docs/` |

## How to run
Needs **Go 1.22+** and **Node.js 20+**.

```powershell
# 1. Backend  → http://localhost:8080
cd backend-go
go run ./cmd/server

# 2. Frontend → http://localhost:3000  (new terminal)
cd frontend-next
npm install                     # also copies PrimeReact themes to public/themes
copy .env.example .env.local    # NEXT_PUBLIC_USE_MOCK=false → real API
npm run dev
```

**Homework 1 (mock data, no backend):** set `NEXT_PUBLIC_USE_MOCK=true` in `.env.local` and restart `npm run dev`.
A yellow "Mock data" badge shows in the header.

### API
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/v1/books?search=&genre=&sortBy=&sortOrder=&page=&limit=` | `sortBy`: createdAt, title, price, publishedDate · `limit` 1–100 |
| GET | `/api/v1/books/{id}` | 404 if missing |
| POST | `/api/v1/books` | 400 with `errors` per field · 409 duplicate ISBN |
| PUT | `/api/v1/books/{id}` | same rules as POST |
| DELETE | `/api/v1/books/{id}` | |
| GET | `/api/v1/genres` | allowed genres |

Error shape: `{"statusCode":400,"message":"Validation failed","errors":{"isbn":"ISBN must be exactly 13 digits"}}`

## Live demo
- Frontend: https://ai-frontend-training.vercel.app
- API: https://ai-frontend-training.onrender.com/health (free tier — sleeps when idle, first request ~1 min)
- Figma (light theme): https://www.figma.com/design/TOKDGIDCcPSzUmeTfrTmLT/Untitled?node-id=0-1&p=f&t=UDgHouXwkjEJypZ4-0

## Checks (all green on October 8, 2026)
```powershell
cd backend-go;    go vet ./...; go test ./... -count=1     # 9 tests pass
cd frontend-next; npm run lint                            # 0 problems
                  npx tsc --noEmit                        # 0 errors
                  npm run build                           # stop `npm run dev` first
                  npm run test:e2e                        # 47 passed (starts backend + frontend if needed)
                  npm run test:e2e:mutation               # 4 passed — creates/deletes data; local by default, QA may run on the demo
```
`npm run test:e2e` also regenerates the screenshots in `frontend-next/docs/screenshots/`.

## Figma comparison
With the backend and frontend running:
```powershell
cd frontend-next; node scripts/figma-compare.mjs      # optional filter, e.g. "List · Light"
```
For each PNG in `figma/` it screenshots the same page, state and theme at the same width and writes
`frontend-next/docs/figma-compare/side-by-side/*.png` (left Figma, right app) plus `report.md` with a
pixel-difference score. Results and the differences kept on purpose: `frontend-next/docs/design-check.md`.

## Prompts and skills used
Followed the training page step by step (setup → design check → mock screen → API → forms →
responsive → bugs → tests → hand-over). Main prompts, adapted from section 11 of the training page:
- *Read the training page and the WM pages (Date format, Three-digit comma, HTML guideline, Light/Dark colour system, QA template, Report) and follow them.*
- *Plan first:* routes `list / create / details/[id] / edit/[id]`, three API layers (`API_ENDPOINTS` → `BookService` → `useGetBooksList`), mock service behind the same interface.
- *Do one step only, then run `npx tsc --noEmit` and `npm run lint` and show me the real output.*
- *Check the page at 1920 … 375 and take a screenshot at each width* → became `e2e/responsive.spec.ts`.
- *Write QA test cases in the WM QA Template format* → `docs/qa-test-cases.md`.
- *Bug — find the cause first, then the smallest fix* (see below).

Skills: the training skills (`fe-responsive-qa`, `smoke-test`, `fe-build-handoff`, …) are not
published yet (due Oct 6), so their steps were done by hand: responsive spec, smoke tests after
each fix, and `docs/build-report.md`.

## Problems I hit and how I solved them
1. **"Add book" button had blue text on a blue background.** Cause: PrimeReact 10 puts its
   theme in a CSS `@layer`, and *any* un-layered rule beats layered rules regardless of
   specificity — so my global `a { color }` overrode `.p-button { color: white }`.
   Fix: `:where(a:not(.p-button)) { … }` (zero specificity, skips buttons).
2. **Dark mode was lost after page load (hydration error)** — dark mode was later removed (October 9) to match the light-only design, but the lesson stands. Cause: I rendered the theme
   `<link>` in `<head>`; Next.js injects its own `<meta>` tags there, and React 19 also matches
   stylesheet links by `href`, so the server and client trees differed and React rebuilt the page,
   dropping `data-theme`. Fix: an inline script creates the theme `<link>` itself, so React never
   renders or compares it (`src/components/layout/theme.ts`).
3. **Playwright could not click the genre dropdown.** `#book-genre` is PrimeReact's hidden
   input; clicks must go to the visible wrapper. Fix: added `className="book-genre-select"` and
   targeted that.

## React / Next.js concepts used (for the review)
Server vs client components (`page.tsx` is server, `…View.tsx` has `"use client"`), dynamic
routes with `params` as a Promise (Next 15), route group `(main)`, props/state (`BookFilters` is
fully controlled by `BookListView`), `useEffect` with dependencies (`useDebounce`), custom hooks
wrapping TanStack Query, list keys (`dataKey="id"`), conditional rendering for
loading/empty/error, controlled forms, and `NEXT_PUBLIC_*` env variables.
