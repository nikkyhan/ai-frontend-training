import { expect, test } from "@playwright/test";
import { bookRows, openBookList, selectDropdown, typeNumber } from "./helpers";

// CREATES, EDITS AND DELETES DATA. Does not run by default.
// Run with: npm run test:e2e:mutation  — never against a shared server without telling the team.

// Unique ISBN per run so the test can be repeated without restarting the backend
const isbn = `97900${Date.now().toString().slice(-8)}`;
const title = `E2E Book ${isbn.slice(-6)}`;

test.describe.serial("Book create → edit → delete", () => {
  test("create shows a toast and the book appears in the list", async ({ page }) => {
    await page.goto("/books/create");
    await page.locator("#book-title").fill(title);
    await page.locator("#book-author").fill("Playwright Bot");
    await page.locator("#book-isbn").fill(isbn);
    await selectDropdown(page, ".book-genre-select", "Science");
    await page.locator("#book-publishedDate").fill("2020-01-15");
    await page.locator("#book-publishedDate").press("Escape");
    await typeNumber(page, "#book-price", "15000");
    await typeNumber(page, "#book-stock", "4");
    await page.getByRole("button", { name: "Create book" }).click();

    await expect(page.getByText("Book created successfully")).toBeVisible();
    await expect(page).toHaveURL(/\/books\/list$/);
    await page.getByLabel("Search books").fill(isbn);
    await expect(bookRows(page)).toHaveCount(1);
    await expect(bookRows(page).first()).toContainText(title);
    await expect(bookRows(page).first()).toContainText("₩15,000");
  });

  test("duplicate ISBN shows the server's error and keeps the typed values", async ({ page }) => {
    await page.goto("/books/create");
    await page.locator("#book-title").fill("Duplicate");
    await page.locator("#book-author").fill("Playwright Bot");
    await page.locator("#book-isbn").fill(isbn);
    await selectDropdown(page, ".book-genre-select", "Fiction");
    await page.locator("#book-publishedDate").fill("2020-01-15");
    await page.locator("#book-publishedDate").press("Escape");
    await typeNumber(page, "#book-price", "100");
    await typeNumber(page, "#book-stock", "1");
    await page.getByRole("button", { name: "Create book" }).click();

    await expect(page.getByRole("alert").filter({ hasText: "A book with this ISBN already exists" })).toBeVisible();
    await expect(page.getByText("This ISBN is already used by another book")).toBeVisible();
    await expect(page.locator("#book-title")).toHaveValue("Duplicate");
  });

  test("edit changes show in the list", async ({ page }) => {
    await openBookList(page);
    await page.getByLabel("Search books").fill(isbn);
    await expect(bookRows(page)).toHaveCount(1);
    await page.getByRole("button", { name: `Edit ${title}` }).click();
    await expect(page.locator("#book-title")).toHaveValue(title);
    await page.locator("#book-title").fill(`${title} v2`);
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Book updated successfully")).toBeVisible();
    await page.getByLabel("Search books").fill(isbn);
    await expect(bookRows(page).first()).toContainText(`${title} v2`);
  });

  test("delete asks for confirmation and removes the book", async ({ page }) => {
    await openBookList(page);
    await page.getByLabel("Search books").fill(isbn);
    await expect(bookRows(page)).toHaveCount(1);
    await page.getByRole("button", { name: `Delete ${title} v2` }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();

    await expect(page.getByText("Book deleted successfully")).toBeVisible();
    await expect(page.getByText("No books match your search")).toBeVisible();
  });
});
