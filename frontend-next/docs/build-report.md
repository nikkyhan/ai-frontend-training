# Build report — Books feature (QA hand-over)

Format: WM | Report (title, summary, content, references, findings, conclusion) with the 10 parts
from training Step 8 Part C. Same content as the build report on the homework page in Notion.

## 1. Build
| | |
|---|---|
| Branch | `main` — https://github.com/nikkyhan/ai-frontend-training |
| Commit | [`58ac71b`](https://github.com/nikkyhan/ai-frontend-training/commit/58ac71ba2a73408a39f9a248432016a81ff361d7) — the build handed over; later commits only change docs |
| Demo | https://ai-frontend-training.vercel.app (frontend, Vercel) |
| API | https://ai-frontend-training.onrender.com (Go backend, Render free tier) |
| Date | October 8, 2026 |

## 2. TL tasks covered
- TL | AI Frontend Training — Building Frontend with Claude Code (for Backend Developers): Homework 1 and Homework 2

## 3. What changed (plain words)
A new **Books** admin area:
- **List** of books you can search (title, author, ISBN), filter by genre, sort and page through (10/20/50) —
  a table on computers, cards on tablets and phones.
- **Add book** and **Edit book** forms with the same checks as the server.
- **Book details** page with Edit and Delete.
- **Delete** always asks "are you sure?" first.
- **Dark mode** button in the header.
- A new Go API (`backend-go`) behind it.

## 4. Fixed issues
None from QA yet. Fixed after the code review (October 8, 2026):
- Dates now use the WM English format with the full month name ("October 26, 2015")
- A missing book (404) is no longer requested twice before "Book not found" shows
- QA test cases marked Positive / Negative with the correct count

Fixed during development:
- Invisible "Add book" button text (CSS `@layer` conflict with PrimeReact)
- Dark mode lost after page load (hydration mismatch)
- Render build failing with "no Go files" (added `backend-go/main.go`)
- Vercel build calling `localhost` instead of the API (added `.env.production`)

## 5. Test accounts / roles
No login in this build. Anyone who opens the link can use every page.

## 6. Data QA must prepare
Nothing. The backend starts with the 12 books from the Figma design and **resets on every restart**.
To test the "No books yet" state, start the backend with `SEED=false`.

## 7. What to test
1. Open the list: 12 books, 10 per page, page 2 has 2.
2. Search "orwell" → only "1984". Search "zzzz" → "No books match your search".
3. Genre filter "Fiction" → 3 books.
4. Sort by price (column header on desktop, "Sort by" dropdown on phone).
5. Add a book with all fields → appears in list; try the same ISBN again → error under ISBN.
6. Try to break the form: empty, 1-letter title, 12-digit ISBN, future date, 1,001-character description.
7. Edit a book → values pre-filled → change → list shows change.
8. Delete from the list and from the details page.
9. Stop the backend → list shows "Could not load books" with Try again.
10. Check 1920 / 1366 / 768 / 375 and dark mode.

Full cases: `docs/qa-test-cases.md` — 42 cases (24 positive, 17 negative, 1 not applicable).

## 8. Known issues / not covered
- No login, roles or permissions (training scope).
- Data is in memory: lost on backend restart.
- Free Render backend sleeps after 15 minutes idle; the first request then takes about 1 minute.
- Tested on Chromium only (Safari/Firefox not checked).
- The error box also shows the API's message (kept on purpose — Homework 2 requires visible API errors).
- Layout follows the Figma design (checked October 8, 2026 at 1440 / 768 / 375); differences kept on purpose are listed in `docs/design-check.md`.

## 9. Results of checks (run October 8, 2026, commit `58ac71b`)
| Check | Result |
|-------|--------|
| `npm run lint` | ✅ pass, 0 problems |
| `npx tsc --noEmit` | ✅ pass, 0 errors |
| `npm run build` | ✅ pass (6 routes) |
| `npm run test:e2e` | ✅ 47 / 47 passed (13 feature + 32 responsive/dark + 2 Figma layout switch) |
| `npm run test:e2e:mutation` | ✅ 4 / 4 passed (local backend only) |
| Playwright HTML report | `docs/playwright-report/index.html` — full run, 51 / 51 incl. mutation |
| `go vet ./...` / `go test ./...` | ✅ pass (9 tests) |
| Live demo, read-only `books.spec.ts` | ✅ 13 / 13 (run on the deployed commit `58ac71b`) |

## 10. Screen sizes and browsers checked
Chromium at 1920, 1600, 1366, 1280, 1024, 991, 768, 640, 480, 375 (list, create, details) —
no sideways scroll. Dark mode at 1366 and 375. Screenshots: `docs/screenshots/`.

## Conclusion
Deployed and ready for QA: demo on Vercel, API on Render, code on `main` (build commit `58ac71b`).
