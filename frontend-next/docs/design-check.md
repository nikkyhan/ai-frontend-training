# Design check — Books list (Homework 1, Step 2 Part A)

**Design:** [Figma — Books](https://www.figma.com/design/rYDrRiVo4LS8Qa7eOpq88n/Untitled?node-id=0-1)
(frames at 1920 / 1440 / 1024 / 768 / 375, light + dark, supplementary states, UI kit).
The screens were first built before the Figma file existed, then updated on Oct 5, 2026 to match it.

## What changed to match Figma (Oct 5, 2026)
| Area | Figma | Implemented |
|------|-------|-------------|
| List ≤ 1024px | Stacked book cards + "Sort by" dropdown | `BookCardList`, sort dropdown in `BookFilters` (CSS switch at `$bp-1024`) |
| List toolbar | Search + genre inside the list card | `.book-list-card` holds toolbar, body and footer |
| List footer | "1–10 of 12 books" · pager · Rows per page | `BookListFooter` |
| Links | Title and back links in brand blue | `.book-title-link`, `.back-link` |
| Badges | Rounded rectangles | `$radius-xs` |
| Genre filter | "All genres" option | first option in `GENRE_OPTIONS` |
| Loading | Skeleton bars + "Loading books…" | `BookListLoading` |
| Form | Range hints, "Optional" beside label, divider above actions, fields disabled while saving | `BookForm` |
| Details | Description in its own section; created/updated date below the card | `BookDetailsView` |
| Delete dialog | Cancel outlined; phones: Delete above Cancel, full width | `.book-confirm-dialog` |
| Sample data | 12-book catalogue shown in the frames | Go seed + mock data |

**Kept on purpose:** the load-error box also shows the API's message under "Could not load books"
(Homework 2 requires API error messages to be visible).

## WM checklist
Below is the WM HTML-guideline checklist with the decision taken and the question for the designer.

| # | WM check | Status | Decision taken / question for designer |
|---|----------|--------|----------------------------------------|
| 1 | Container size | Decided | One container, max 1,280px, 24px side padding (16px ≤768px). *Q: fluid or fixed container?* |
| 2 | Same spacing for same elements | Done | 4px spacing scale in `_variables.scss` (`$space-1` … `$space-10`), used everywhere |
| 3 | Same components on every screen | Done | One table, one form, one state box, one page header reused on all 4 pages |
| 4 | One font family, clear sizes | Decided | System font stack; h1 28 / h2 22 / h3 18 / body 16 / small 14 / tiny 12. *Q: brand font?* |
| 5 | Text wrapping on small screens | Done | Titles wrap (`overflow-wrap: anywhere`); table scrolls inside its card instead |
| 6 | Font + colour library | Decided | Palette `$grey-g1…`, `$blue-b1…`, etc. with `[day]`/`[night]` tokens. *Q: official palette?* |
| 7 | Empty / loading / no-image designs | Decided | Skeleton rows for loading; "No books yet" and "No books match your search" empty states; error state with retry. *Q: approve copy and icons* |
| 8 | Button width from padding | Done | No fixed button widths; full-width buttons only on phones (≤480px) |
| 9 | Images fit their box | N/A | Screen has no images; global `img { max-width: 100% }` |
| 10 | Browser support | Asked | *Q: Chrome only, or Safari/Firefox too?* (tested: Chromium) |

## Open questions for the designer
1. Mobile table: keep horizontal scroll inside the card (current), or switch to stacked cards ≤640px?
2. Should the low-stock threshold (≤ 5) be shown as a warning colour?
3. Dark mode colours — are the night values acceptable, or will design supply them?
