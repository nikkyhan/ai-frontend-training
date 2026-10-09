# Build report — Books feature (QA hand-over)

Format: WM | Report (title, summary, content, references, findings, conclusion) with the 10 parts
from training Step 8 Part C. Same content as the build report on the homework page in Notion.

## 1. Build
| | |
|---|---|
| Branch | `main` — https://github.com/nikkyhan/ai-frontend-training |
| Commit | [`4859edf`](https://github.com/nikkyhan/ai-frontend-training/commit/4859edf62689f9736605d5459156cd083822583b) — the build handed over; later commits only add docs and the test report |
| Demo | https://ai-frontend-training.vercel.app (frontend, Vercel) |
| API | https://ai-frontend-training.onrender.com (Go backend, Render free tier) |
| Test report | https://ai-frontend-training.vercel.app/qa-report/index.html (opens in the browser) |
| Date | October 9, 2026 |

## 2. TL tasks covered
- TL | AI Frontend Training — Building Frontend with Claude Code (for Backend Developers): Homework 1 and Homework 2

## 3. What changed (plain words)
A **Books** admin area:
- **List** of books you can search (title, author, ISBN), filter by genre, sort and page through (10/20/50) —
  a table on computers, cards on tablets and phones.
- **Add book** and **Edit book** forms with the same checks as the server.
- **Book details** page with Edit and Delete.
- **Delete** always asks "are you sure?" first.
- Light theme only, as in the design (the dark-mode button was removed on October 9).
- A Go API (`backend-go`) behind it.

## 4. Fixed issues
None from QA. Fixed after the design review (October 9, 2026):
- Filled buttons are darker blue / red so white text passes 4.5:1 contrast
- One colour per role; every field and text button 46px; nav 40px; pager and icon buttons 44px
- Long titles and authors without spaces wrap instead of widening the page
- Screen readers hear "required" and "invalid" on every required field, linked to its error message
- A too-long description is flagged while typing

Fixed after the code review (October 8, 2026):
- Dates use the WM English format with the full month name ("October 26, 2015")
- A missing book (404) is no longer requested twice before "Book not found" shows
- QA test cases marked Positive / Negative with the correct count

Fixed during development:
- Invisible "Add book" button text (CSS `@layer` conflict with PrimeReact)
- Theme lost after page load (hydration mismatch)
- Render build failing with "no Go files" (added `backend-go/main.go`)
- Vercel build calling `localhost` instead of the API (added `.env.production`)
- Vercel branch URL blocked by CORS (API allows this project's Vercel URLs)

## 5. Test accounts / roles
No login in this build. Anyone who opens the link can use every page.

## 6. Data QA must prepare
Nothing. The backend starts with the 12 books from the Figma design and **resets on every restart**.
To test the "No books yet" state, start the backend with `SEED=false`.
Create / edit / delete tests can run on the demo (they delete only the book they create):
`PLAYWRIGHT_BASE_URL=https://ai-frontend-training.vercel.app E2E_MUTATION=true npx playwright test`

## 7. What to test
1. Open the list: 12 books, 10 per page, page 2 has 2.
2. Search "orwell" → only "1984". Search "zzzz" → "No books match your search".
3. Genre filter "Fiction" → 3 books.
4. Sort by price (column header on desktop, "Sort by" dropdown on phone).
5. Add a book with all fields → appears in list; try the same ISBN again → error under ISBN.
6. Try to break the form: empty, 1-letter title, 12-digit ISBN, future date, 1,001-character description
   (the description error shows while typing).
7. Edit a book → values pre-filled → change → list shows change.
8. Delete from the list and from the details page.
9. Stop the backend → list shows "Could not load books" with Try again.
10. Check 1440 / 768 / 375 on list, create, details and edit.

Full cases: `docs/qa-test-cases.md` — 46 cases (24 positive, 21 negative, 1 not applicable).

## 8. Known issues / not covered
- No login, roles or permissions (training scope).
- Data is in memory: lost on backend restart.
- Free Render backend sleeps after 15 minutes idle; the first request then takes about 1 minute.
- Tested on Chromium only (Safari/Firefox not checked).
- The error box also shows the API's message (kept on purpose — Homework 2 requires visible API errors).
- Differences from the Figma file kept on purpose (darker buttons, one field height, 44px icon buttons,
  full-month dates) are listed in `docs/design-check.md`; the Figma file still needs the same values.

## 9. Results of checks (run October 9, 2026, commit `4859edf`)
| Check | Result |
|-------|--------|
| `npm run lint` | ✅ pass, 0 problems |
| `npx tsc --noEmit` | ✅ pass, 0 errors |
| `npm run build` | ✅ pass (6 routes) |
| `go vet ./...` / `go test ./...` | ✅ pass |
| Playwright, local, full run incl. mutation | ✅ 71 / 71 |
| **Playwright on the live demo, full run incl. mutation** | ✅ **71 / 71** — 13 feature + 4 mutation + 44 screen-size + 2 layout + 5 design-token + 3 audit |
| Playwright HTML report (live-demo run) | https://ai-frontend-training.vercel.app/qa-report/index.html · copy in `docs/playwright-report/` |

## 10. Screen sizes and browsers checked
Chromium at 1920, 1600, **1440**, 1366, 1280, 1024, 991, **768**, 640, 480, **375** for list, create, details and
edit — no sideways scroll, on the live demo. Screenshots: `docs/screenshots/`.

## Conclusion
Deployed and ready for QA: demo on Vercel, API on Render, code on `main` (build commit `4859edf`).
