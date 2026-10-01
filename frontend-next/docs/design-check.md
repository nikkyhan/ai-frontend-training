# Design check — Books list (Homework 1, Step 2 Part A)

No Figma frame was provided for this homework, so the screen follows the existing PrimeReact
Lara theme plus our own WM-style tokens. Below is the WM HTML-guideline checklist with the
decision taken and the question that **must go to the designer** before real project work.

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
