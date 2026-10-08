import { expect, test } from "@playwright/test";
import { bookRows, openBookList, selectDropdown } from "./helpers";

// Read-only tests against the seeded backend (12 books). Safe to run anywhere.

test.describe("Books list", () => {
  test("opens with title, count and first page of rows", async ({ page }) => {
    await openBookList(page);
    await expect(page).toHaveTitle("Books | Books Admin");
    await expect(page.getByText("1–10 of 12 books")).toBeVisible();
    await expect(bookRows(page)).toHaveCount(10);
  });

  test("search by author shows the matching book", async ({ page }) => {
    await openBookList(page);
    await page.getByLabel("Search books").fill("orwell");
    await expect(bookRows(page)).toHaveCount(1);
    await expect(bookRows(page).first()).toContainText("1984");
  });

  test("search with no results shows the empty state and can be cleared", async ({ page }) => {
    await openBookList(page);
    await page.getByLabel("Search books").fill("zzzz-no-such-book");
    await expect(page.getByText("No books match your search")).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).first().click();
    await expect(bookRows(page)).toHaveCount(10);
  });

  test("genre filter shows only that genre", async ({ page }) => {
    await openBookList(page);
    await selectDropdown(page, ".book-genre-filter", "Fiction");
    await expect(page.getByText("1–3 of 3 books")).toBeVisible();
    await expect(bookRows(page)).toHaveCount(3);
  });

  test("next page shows the remaining rows", async ({ page }) => {
    await openBookList(page);
    await page.getByRole("button", { name: "Next Page" }).click();
    await expect(bookRows(page)).toHaveCount(2);
  });

  test("sort by price ascending puts the cheapest first", async ({ page }) => {
    await openBookList(page);
    await page.getByRole("columnheader", { name: "Price" }).click();
    await expect(bookRows(page).first()).toContainText("The Very Hungry Caterpillar");
    await expect(bookRows(page).first()).toContainText("₩10,500");
  });

  test("shows a loading placeholder while data is on its way", async ({ page }) => {
    await page.route("**/api/v1/books?**", async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });
    await page.goto("/books/list");
    await expect(page.locator(".p-skeleton").first()).toBeVisible();
    await expect(page.locator(".book-title-link").first()).toBeVisible();
  });

  test("shows the error state when the API cannot be reached", async ({ page }) => {
    await page.route("**/api/v1/books?**", (route) => route.abort("connectionrefused"));
    await page.goto("/books/list");
    await expect(page.getByText("Could not load books")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Cannot reach the server")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });
});

test.describe("Book details", () => {
  test("opens from the list and shows formatted values", async ({ page }) => {
    await openBookList(page);
    await page.getByLabel("Search books").fill("9780060254926");
    await expect(bookRows(page)).toHaveCount(1);
    await page.getByRole("link", { name: "Where the Wild Things Are" }).click();
    await expect(page).toHaveURL(/\/books\/details\/\d+$/);
    await expect(page.getByRole("heading", { name: "Where the Wild Things Are" })).toBeVisible();
    await expect(page.getByText("₩12,500")).toBeVisible();
    await expect(page.getByText("November 9, 1988")).toBeVisible();
    await expect(page.getByText("No description")).toBeVisible();
  });

  test("unknown ID shows Book not found", async ({ page }) => {
    await page.goto("/books/details/999999");
    await expect(page.getByText("Book not found").first()).toBeVisible();
  });
});

test.describe("Book form validation", () => {
  test("empty submit shows every required message and sends nothing", async ({ page }) => {
    let posted = false;
    page.on("request", (req) => {
      if (req.method() === "POST" && req.url().includes("/api/v1/books")) posted = true;
    });
    await page.goto("/books/create");
    await page.getByRole("button", { name: "Create book" }).click();
    for (const msg of [
      "Title is required",
      "Author is required",
      "ISBN is required",
      "Genre is required",
      "Published date is required",
      "Price is required",
      "Stock is required",
    ]) {
      await expect(page.getByText(msg)).toBeVisible();
    }
    expect(posted).toBe(false);
  });

  test("wrong formats show the same messages as the backend", async ({ page }) => {
    await page.goto("/books/create");
    await page.locator("#book-title").fill("A");
    await page.locator("#book-isbn").fill("12345");
    await page.locator("#book-description").fill("x".repeat(1001));
    await page.getByRole("button", { name: "Create book" }).click();
    await expect(page.getByText("Title must be at least 2 characters")).toBeVisible();
    await expect(page.getByText("ISBN must be exactly 13 digits")).toBeVisible();
    await expect(page.getByText("Description must be at most 1,000 characters")).toBeVisible();
  });

  test("edit form is filled with the existing values", async ({ page }) => {
    await openBookList(page);
    await page.getByLabel("Search books").fill("9780132350884");
    await expect(bookRows(page)).toHaveCount(1);
    await page.getByRole("button", { name: "Edit Clean Code" }).click();
    await expect(page.locator("#book-title")).toHaveValue("Clean Code");
    await expect(page.locator("#book-isbn")).toHaveValue("9780132350884");
    await expect(page.locator("#book-price")).toHaveValue("32,000");
  });
});
