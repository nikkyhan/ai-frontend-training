# QA test cases — Books feature

Format follows WM | QA Template ("Verify that …"). Covers every area in the training Step 7 table:
list, create, details, edit, delete, search / filter, paging, validation, roles, states and screen sizes.

- **46 cases — 24 Positive, 21 Negative, 1 not applicable (roles).** IDs are grouped by area (BK-0x, BK-1x, …), so the numbers are not continuous.
- **Type:** Positive = the normal, valid path works · Negative = wrong input, missing data or a failure is handled.
- **Auto:** covered by a Playwright test (file › test). "—" = manual only.
- **Precondition for all cases** unless stated: backend-go running with seed data (12 books), frontend at
  `http://localhost:3000` or the demo https://ai-frontend-training.vercel.app (the demo data resets when the API restarts).

## 1. Page opens (list, details)
| ID | Type | Precondition | Steps | Expected result | Auto |
|----|------|--------------|-------|-----------------|------|
| BK-01 | Positive | — | Verify that `/books/list` opens | Tab title "Books \| Books Admin", heading "Books", footer "1–10 of 12 books", 10 rows; first row "A Brief History of Time" | books.spec › opens with title… |
| BK-02 | Positive | — | Verify that `/` redirects | Redirected to `/books/list` | — |
| BK-03 | Positive | — | Verify that the details page opens from the list ("Where the Wild Things Are") | Heading = title, "by Maurice Sendak", ISBN, genre, "November 9, 1988", "₩12,500", "No description"; created/updated date below the card | books.spec › opens from the list… |
| BK-04 | Negative | — | Verify that an unknown URL `/no-such-page` is handled | "Page not found" with a link back to the list | — |

## 2. Main flow (create, edit, delete)
| ID | Type | Precondition | Steps | Expected result | Auto |
|----|------|--------------|-------|-----------------|------|
| BK-10 | Positive | — | Verify that a book can be created: Add book → fill all valid fields → Create book | Toast "Book created successfully", back on list, book findable by ISBN | mutation › create… |
| BK-11 | Positive | BK-10 done | Verify that the book can be edited: Edit → change title → Save changes | Toast "Book updated successfully", list shows the new title | mutation › edit… |
| BK-12 | Positive | BK-10 done | Verify that the book can be deleted from the list: delete icon → Delete | Confirm dialog shown; after Delete, toast "Book deleted successfully", row gone | mutation › delete… |
| BK-13 | Positive | — | Verify that delete can be cancelled: delete icon → Cancel | Dialog closes, book still in the list | — |
| BK-14 | Positive | Details page open | Verify that delete works from the details page: Delete → Delete | Back to the list, book gone | — |
| BK-15 | Negative | — | Verify that a double click does not create two books: double-click "Create book" quickly | Only one book is created (button shows loading and is disabled) | — |
| BK-16 | Negative | — | Verify that editing a missing book is handled: open `/books/edit/999999` | "Book not found" + "Go to book list" | — |
| BK-17 | Negative | Edit page open | Verify that edit keeps the backend rules: clear Title → Save changes | "Title is required" under Title; nothing saved | — |

## 3. Validation (frontend rules = backend rules)
| ID | Type | Precondition | Steps | Expected result | Auto |
|----|------|--------------|-------|-----------------|------|
| BK-20 | Negative | Add book page | Verify that an empty submit is blocked | Title / Author / ISBN / Genre / Published date / Price / Stock "… is required"; no request sent | books.spec › empty submit… |
| BK-21 | Negative | Add book page | Verify that a 1-character title is rejected: Title "A" | "Title must be at least 2 characters" | books.spec › wrong formats… |
| BK-22 | Negative | Add book page | Verify that a too-long title is rejected: Title 201 characters | "Title must be at most 200 characters" | — |
| BK-23 | Negative | Add book page | Verify that a wrong ISBN is rejected: "12345" or with letters | "ISBN must be exactly 13 digits" | books.spec › wrong formats… |
| BK-24 | Negative | Add book page | Verify that a too-long description is rejected: 1,001 characters | "Description must be at most 1,000 characters" | books.spec › wrong formats… |
| BK-25 | Negative | Add book page | Verify that a future published date is rejected (type it) | "Published date cannot be in the future" | — |
| BK-26 | Negative | A book with the ISBN exists | Verify that a duplicate ISBN is rejected by the server | Banner "A book with this ISBN already exists", error under ISBN, typed values kept | mutation › duplicate ISBN… |
| BK-27 | Positive | — | Verify that the edit form is pre-filled (Clean Code) | Every field shows the saved value; price "32,000" | books.spec › edit form is filled… |
| BK-28 | Negative | Backend stopped | Verify that a save with the server down keeps the values | Banner "Cannot reach the server…", values kept | — |

## 4. List behaviour (search, filter, sort, paging)
| ID | Type | Precondition | Steps | Expected result | Auto |
|----|------|--------------|-------|-----------------|------|
| BK-30 | Positive | — | Verify that search by author works: "orwell" | 1 row: "1984" | books.spec › search by author… |
| BK-31 | Positive | — | Verify that search by ISBN works: `9780060254926` | 1 row | books.spec › opens from the list… |
| BK-32 | Positive | — | Verify that the genre filter works: Fiction | "1–3 of 3 books": 1984, To Kill a Mockingbird, The Great Gatsby | books.spec › genre filter… |
| BK-33 | Positive | — | Verify that paging works: Next page | 2 rows on page 2 | books.spec › next page… |
| BK-34 | Positive | — | Verify that sorting works: click "Price" header | Cheapest first (The Very Hungry Caterpillar, ₩10,500); click again → most expensive first | books.spec › sort by price… |
| BK-35 | Negative | — | Verify that a search with no results is handled: "zzzz" | "No books match your search" + Clear filters; clearing restores 10 rows | books.spec › search with no results… |
| BK-36 | Positive | — | Verify that rows per page works: 20 | 12 rows, page 1 | — |
| BK-37 | Negative | On page 2 | Verify that deleting the last row of a page is handled | List moves back to page 1 | — |

## 5. Roles
| ID | Type | Precondition | Steps | Expected result | Auto |
|----|------|--------------|-------|-----------------|------|
| BK-40 | — | — | **Not applicable**: this training app has no login or roles. In a real project: the allowed role sees the menu and page; other roles get no menu item and are blocked at the URL (menu, route guard and role list updated together). | — | — |

## 6. States (loading, empty, error)
| ID | Type | Precondition | Steps | Expected result | Auto |
|----|------|--------------|-------|-----------------|------|
| BK-50 | Positive | Slow network (DevTools → Slow 3G) | Verify that the loading state shows: open the list | Grey skeleton rows + "Loading books…", then data | books.spec › loading placeholder… |
| BK-51 | Negative | Backend stopped | Verify that a load error is handled: open the list | "Could not load books", "Cannot reach the server…", Try again | books.spec › error state… |
| BK-52 | Negative | Backend started with `SEED=false` | Verify that an empty catalogue is handled: open the list | "No books yet" + "Add the first book" | — |
| BK-53 | Negative | — | Verify that an unknown book ID is handled: `/books/details/999999` | "Book not found" + link to the list (shown after one request — 404 is not retried) | books.spec › unknown ID… |

## 7. Screen sizes and theme
| ID | Type | Precondition | Steps | Expected result | Auto |
|----|------|--------------|-------|-----------------|------|
| BK-60 | Positive | — | Verify list, create, details and edit at 1920 / 1600 / 1440 / 1366 / 1280 / 1024 / 991 / 768 / 640 / 480 / 375 | No sideways page scroll; the table scrolls inside its card | responsive.spec (44 tests) |
| BK-61 | Positive | — | Verify the light theme only | No dark-mode toggle; filled buttons #2563eb / #dc2626 with white text (≥ 4.5:1); every field and text button 46px | responsive.spec › Design tokens |
| BK-62 | Positive | 375px | Verify the phone header | "Books Admin" + Books + Add book fit on one row; "Add book" button under the page title; form buttons full width | screenshots |

## 8. Figma layout
| ID | Type | Precondition | Steps | Expected result | Auto |
|----|------|--------------|-------|-----------------|------|
| BK-70 | Positive | — | Verify the list at ≥ 1025px (1280 / 1366 / 1440 / 1920) | Table inside the list card; search + genre in the card toolbar; footer "1–10 of 12 books" · pager · Rows per page | responsive.spec › 1280px shows the table… |
| BK-71 | Positive | — | Verify the list at ≤ 1024px (1024 / 768 / 375) | One card per book (title, author, ISBN / Price / Published, genre + stock badges, actions); "Sort by" dropdown shown | responsive.spec › 375px shows 10 cards… |
| BK-72 | Positive | Card view | Verify sorting in the card view: Sort by price (low to high) | First card "The Very Hungry Caterpillar" | responsive.spec › 375px shows 10 cards… |
| BK-73 | Positive | — | Verify the saving state: submit a form and watch | All fields and Cancel disabled; button shows spinner + "Saving…" | — |
| BK-74 | Positive | 375px | Verify the phone delete dialog | Delete (red) above Cancel, both full width | — |

## 9. Figma audit fixes (October 9, 2026)
| ID | Type | Precondition | Steps | Expected result | Auto |
|----|------|--------------|-------|-----------------|------|
| BK-80 | Negative | 375px | Verify a 190-character title without spaces on details and edit | Title and subtitle wrap; no sideways page scroll | responsive.spec › Figma audit fixes |
| BK-81 | Negative | 375px | Verify a 90-character author without spaces on details and list cards | Author wraps; nothing clipped | responsive.spec › Figma audit fixes |
| BK-82 | Negative | Add book page | Verify screen-reader attributes after an empty submit | Title, Author, ISBN, Genre, Published date, Price, Stock have aria-required, aria-invalid and aria-describedby pointing at their error | responsive.spec › Figma audit fixes |
| BK-83 | Negative | Add book page | Verify a 1,001-character description while typing | "Description must be at most 1,000 characters" and a red "1,001 / 1,000" appear before submit | responsive.spec › Figma audit fixes |
