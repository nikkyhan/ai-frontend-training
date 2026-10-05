# Build report — Books feature (QA hand-over)

Format: WM | Report (title, summary, content, references, findings, conclusion) with the 10 parts
from training Step 8 Part C.

## 1. Build
| | |
|---|---|
| Branch | `feature/books-crud` (to be created from `development`) — **not yet pushed: Git is not installed on the dev machine** |
| Commit | — (fill in after first commit) |
| Link | Local: `http://localhost:3000` (no shared deploy yet) |
| Date | Oct 1, 2026 |

## 2. TL tasks covered
- TL | AI Frontend Training — Building Frontend with Claude Code (for Backend Developers): Homework 1 and Homework 2

## 3. What changed (plain words)
A new **Books** admin area:
- **List** of books with search (title, author, ISBN), genre filter, sorting by title/price/date, and pages of 10/20/50.
- **Add book** and **Edit book** forms with the same checks as the server.
- **Book details** page with Edit and Delete.
- **Delete** always asks "are you sure?" first.
- **Dark mode** button in the header.
- New Go API (`backend-go`) the screens talk to.

## 4. Fixed issues
None — first build.

## 5. Test accounts / roles
No login in this build. Anyone who opens the URL can use every page.

## 6. Data QA must prepare
Nothing. The backend starts with 12 sample books and **resets on every restart**.
To test the "No books yet" state, start the backend with `SEED=false`.

## 7. What to test
1. Open the list: 12 books, 10 per page, page 2 has 2.
2. Search "orwell" → only "1984". Search "zzzz" → "No books match your search".
3. Genre filter "Fiction" → 3 books.
4. Sort by price (click header twice).
5. Add a book with all fields → appears in list; try the same ISBN again → error under ISBN.
6. Try to break the form: empty, 1-letter title, 12-digit ISBN, future date, 1,001-character description.
7. Edit a book → values pre-filled → change → list shows change.
8. Delete from the list and from the details page.
9. Stop the backend → list shows "Could not load books" with Try again.
10. Check 1920 / 1366 / 768 / 375 and dark mode.

Full cases: `docs/qa-test-cases.md` (BK-01 … BK-62).

## 8. Known issues / not covered
- No login, roles or permissions (training scope).
- Data is in memory: lost on backend restart.
- Tested on Chromium only (Safari/Firefox not checked).
- Layout follows the Figma design (updated Oct 5, 2026); the list of changes is in `docs/design-check.md`.

## 9. Results of checks (run Oct 5, 2026)
| Check | Result |
|-------|--------|
| `npm run lint` | ✅ pass, 0 problems |
| `npx tsc --noEmit` | ✅ pass, 0 errors |
| `npm run build` | ✅ pass (6 routes) |
| `npm run test:e2e` | ✅ 47 / 47 passed (13 feature + 32 responsive/dark + 2 Figma layout switch) |
| `npm run test:e2e:mutation` | ✅ 4 / 4 passed (local backend only) |
| Mock mode (`NEXT_PUBLIC_USE_MOCK=true`) | ✅ 12 / 12 feature tests passed (network-error test does not apply to mock) |
| `go vet ./...` / `go test ./...` | ✅ pass (9 tests) |

## 10. Screen sizes and browsers checked
Chromium at 1920, 1600, 1366, 1280, 1024, 991, 768, 640, 480, 375 (list, create, details) —
no sideways scroll. Dark mode at 1366 and 375. Screenshots: `docs/screenshots/`.

## Conclusion
Ready for QA on a local build. Before a shared QA round: install Git, push the branch, and
decide where the demo is hosted (still open in the training doc 🟡).
