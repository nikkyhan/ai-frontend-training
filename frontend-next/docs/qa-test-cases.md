# QA test cases — Books feature

Format follows WM | QA Template ("Verify that …"). Covers every area in the training Step 7 table.
**Auto** = covered by a Playwright test (file › test). Precondition for all cases unless stated:
backend-go running with seed data (12 books), frontend at `http://localhost:3000`.

## 1. Page opens
| ID | Precondition | Steps | Expected result | Auto |
|----|--------------|-------|-----------------|------|
| BK-01 | — | Open `/books/list` | Tab title "Books \| Books Admin", heading "Books", "12 books", 10 rows | books.spec › opens with title… |
| BK-02 | — | Open `/` | Redirected to `/books/list` | — |
| BK-03 | — | Open `/books/details/1` | Heading = book title, ISBN, genre, date "Oct 26, 2015", price "₩42,000" | books.spec › opens from the list… |
| BK-04 | — | Open `/no-such-page` | "Page not found" with link back to list | — |

## 2. Main flow
| ID | Precondition | Steps | Expected result | Auto |
|----|--------------|-------|-----------------|------|
| BK-10 | — | Add book → fill all valid fields → Create book | Toast "Book created successfully", back on list, book findable by ISBN | mutation › create… |
| BK-11 | BK-10 done | Edit the new book → change title → Save changes | Toast "Book updated successfully", list shows new title | mutation › edit… |
| BK-12 | BK-10 done | Click delete icon → Delete | Confirm dialog shown; after Delete, toast "Book deleted successfully", row gone | mutation › delete… |
| BK-13 | — | Delete icon → Cancel | Dialog closes, book still in list | — |
| BK-14 | Details page | Delete → Delete | Back to list, book gone | — |
| BK-15 | — | Create book, double-click "Create book" quickly | Only one book is created (button shows loading and is disabled) | — |

## 3. Validation (frontend rules = backend rules)
| ID | Steps | Expected result | Auto |
|----|-------|-----------------|------|
| BK-20 | Submit empty create form | Title/Author/ISBN/Genre/Published date/Price/Stock "… is required"; no request sent | books.spec › empty submit… |
| BK-21 | Title "A" | "Title must be at least 2 characters" | books.spec › wrong formats… |
| BK-22 | Title 201 characters | "Title must be at most 200 characters" | — |
| BK-23 | ISBN "12345" or with letters | "ISBN must be exactly 13 digits" | books.spec › wrong formats… |
| BK-24 | Description 1,001 characters | "Description must be at most 1,000 characters" | books.spec › wrong formats… |
| BK-25 | Published date in the future (type it) | "Published date cannot be in the future" | — |
| BK-26 | ISBN already used by another book | Banner "A book with this ISBN already exists", field error under ISBN, typed values kept | mutation › duplicate ISBN… |
| BK-27 | Edit a book | Every field pre-filled with saved values (price shown "38,500") | books.spec › edit form is filled… |
| BK-28 | Stop backend, submit valid form | Banner "Cannot reach the server…", values kept | — |

## 4. List behaviour
| ID | Steps | Expected result | Auto |
|----|-------|-----------------|------|
| BK-30 | Search "orwell" | 1 row: "1984" | books.spec › search by author… |
| BK-31 | Search by ISBN `9780134190440` | 1 row | books.spec › opens from the list… |
| BK-32 | Genre = Technology | "3 books", 3 rows | books.spec › genre filter… |
| BK-33 | Next page | 2 rows on page 2 | books.spec › next page… |
| BK-34 | Click "Price" header | Cheapest first (The Little Prince, ₩9,900); click again → most expensive first | books.spec › sort by price… |
| BK-35 | Search "zzzz" | "No books match your search" + Clear filters; clearing restores 10 rows | books.spec › search with no results… |
| BK-36 | Change rows per page to 20 | 12 rows, page 1 | — |
| BK-37 | On page 2, delete its last row | List moves back to page 1 | — |

## 5. Roles
| ID | Steps | Expected result | Auto |
|----|-------|-----------------|------|
| BK-40 | — | **Not applicable**: this training app has no login/roles. In a real project add: allowed role sees menu + page; other roles get no menu item and are blocked at the URL (menu, route guard and role list updated together). | — |

## 6. States
| ID | Steps | Expected result | Auto |
|----|-------|-----------------|------|
| BK-50 | Slow network (DevTools → Slow 3G), open list | Grey skeleton rows, then data | books.spec › loading placeholder… |
| BK-51 | Stop backend, open list | "Could not load books", "Cannot reach the server…", Try again button | books.spec › error state… |
| BK-52 | Start backend with `SEED=false`, open list | "No books yet" + "Add the first book" | — |
| BK-53 | Open `/books/details/999999` | "Book not found" + link to list | books.spec › unknown ID… |

## 7. Screen sizes and theme
| ID | Steps | Expected result | Auto |
|----|-------|-----------------|------|
| BK-60 | List, create, details at 1920 / 1600 / 1366 / 1280 / 1024 / 991 / 768 / 640 / 480 / 375 | No sideways page scroll; table scrolls inside its card | responsive.spec (30 tests) |
| BK-61 | Toggle moon/sun icon | Whole UI switches dark/light; choice remembered after reload | responsive.spec › dark mode… |
| BK-62 | 375px | Header shows icon + Books + Add book + theme toggle without overlap; form buttons full width | screenshots |
