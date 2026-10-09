import { expect, test, type Page } from "@playwright/test";

// WM breakpoints (1440 added for the QA / Figma widths 1440 · 768 · 375). Each page is
// checked for sideways scrolling and screenshotted to docs/screenshots/.
const WIDTHS = [1920, 1600, 1440, 1366, 1280, 1024, 991, 768, 640, 480, 375];
const HEIGHT = 900;

const PAGES = [
  { name: "books-list", path: "/books/list", ready: ".book-title-link:visible" },
  { name: "books-create", path: "/books/create", ready: "#book-title" },
  { name: "books-details", path: "/books/details/1", ready: ".book-details-grid" },
  { name: "books-edit", path: "/books/edit/1", ready: "#book-title" },
];

async function pageScrollsSideways(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
}

for (const target of PAGES) {
  test.describe(`Responsive: ${target.name}`, () => {
    for (const width of WIDTHS) {
      test(`${width}px has no sideways scroll`, async ({ page }) => {
        await page.setViewportSize({ width, height: HEIGHT });
        await page.goto(target.path);
        await expect(page.locator(target.ready).first()).toBeVisible();
        expect(await pageScrollsSideways(page)).toBe(false);
        await page.screenshot({ path: `docs/screenshots/${target.name}-${width}.png`, fullPage: true });
      });
    }
  });
}

// Figma: table at ≥ 1025px, stacked cards with a sort dropdown at ≤ 1024px
test.describe("List layout switch", () => {
  test("1280px shows the table, no cards", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: HEIGHT });
    await page.goto("/books/list");
    await expect(page.locator(".p-datatable-tbody > tr")).toHaveCount(10);
    await expect(page.locator(".book-card").first()).toBeHidden();
    await expect(page.getByLabel("Sort books")).toBeHidden();
  });

  test("375px shows 10 cards and a working sort dropdown", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: HEIGHT });
    await page.goto("/books/list");
    const cards = page.locator(".book-card");
    await expect(cards).toHaveCount(10);
    await expect(cards.first()).toBeVisible();
    await expect(cards.first()).toContainText("A Brief History of Time");
    await expect(page.locator(".p-datatable")).toBeHidden();

    await page.locator(".book-sort-filter").click();
    await page.getByRole("option", { name: "Sort by price (low to high)" }).click();
    await expect(cards.first()).toContainText("The Very Hungry Caterpillar");
    await expect(page.getByText("1–10 of 12 books")).toBeVisible();
  });
});

// Design review: contrast ≥ 4.5:1 on filled buttons, one field height, light theme only
const BRAND = "rgb(37, 99, 235)"; // #2563eb
const DANGER = "rgb(220, 38, 38)"; // #dc2626
const WHITE = "rgb(255, 255, 255)";

test.describe("Design tokens", () => {
  test("filled buttons use the brand blue with a white label", async ({ page }) => {
    await page.goto("/books/list");
    const addBook = page.getByRole("link", { name: "Add book" }).last();
    await expect(addBook).toHaveCSS("background-color", BRAND);
    await expect(addBook).toHaveCSS("color", WHITE);

    await page.goto("/books/create");
    const create = page.getByRole("button", { name: "Create book" });
    await expect(create).toHaveCSS("background-color", BRAND);
    await expect(create).toHaveCSS("color", WHITE);
  });

  test("details Edit / Delete labels use the brand blue and danger red", async ({ page }) => {
    await page.goto("/books/details/1");
    await expect(page.getByRole("link", { name: "Edit" })).toHaveCSS("color", BRAND);
    await expect(page.getByRole("button", { name: "Delete" })).toHaveCSS("color", DANGER);
  });

  test("every field and text button in the form is 46px ($control-lg)", async ({ page }) => {
    await page.goto("/books/create");
    await expect(page.locator("#book-title")).toBeVisible();
    const heights = await page.evaluate(() =>
      ["#book-title", "#book-isbn", ".book-genre-select", "#book-publishedDate", "#book-price", "#book-stock"]
        .map((sel) => document.querySelector(sel)!)
        .concat(Array.from(document.querySelectorAll(".form-actions .p-button")))
        .map((el) => Math.round(el.getBoundingClientRect().height)),
    );
    expect(new Set(heights)).toEqual(new Set([46]));
  });

  test("list toolbar fields share the field height; row icons are 44px", async ({ page }) => {
    await page.goto("/books/list");
    await expect(page.locator(".book-title-link:visible").first()).toBeVisible();
    const h = (sel: string) => page.locator(sel).first().evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(await h(".book-search .p-inputtext")).toBe(46);
    expect(await h(".book-genre-filter")).toBe(46);
    expect(await h(".book-row-actions .p-button:visible")).toBe(44);
  });

  test("light theme only — no dark-mode toggle", async ({ page }) => {
    await page.goto("/books/list");
    await expect(page.getByRole("button", { name: /dark mode|light mode/i })).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", "dark");
  });
});

// Figma audit (October 9, 2026): proposed fixes that are now built
test.describe("Figma audit fixes", () => {
  const LONG = "VeryLongUnbrokenBookTitle".repeat(8).slice(0, 190);
  const AUTHOR = "AuthorWithAVeryLongUnbrokenName".repeat(3).slice(0, 90);

  test("a 190-character title and 90-character author never widen the page at 375px", async ({ page }) => {
    // Serve a long-text book for this test only (read-only, nothing is saved)
    await page.route("**/api/v1/books/1", async (route) => {
      const res = await route.fetch();
      const json = await res.json();
      json.data.title = LONG;
      json.data.author = AUTHOR;
      await route.fulfill({ response: res, json });
    });
    await page.setViewportSize({ width: 375, height: HEIGHT });
    for (const path of ["/books/details/1", "/books/edit/1"]) {
      await page.goto(path);
      await expect(page.locator(path.includes("edit") ? "#book-title" : ".book-details-grid")).toBeVisible();
      await expect(page.getByText(LONG).first()).toBeVisible();
      expect(await pageScrollsSideways(page), path).toBe(false);
    }
  });

  test("required fields expose aria-required, aria-invalid and their error text", async ({ page }) => {
    await page.goto("/books/create");
    await expect(page.locator("#book-title")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Create book" }).click();
    await expect(page.getByText("Title is required")).toBeVisible();
    for (const id of ["title", "author", "isbn", "genre", "publishedDate", "price", "stock"]) {
      const input = page.locator(`#book-${id}`);
      await expect(input, id).toHaveAttribute("aria-required", "true");
      await expect(input, id).toHaveAttribute("aria-invalid", "true");
      await expect(input, id).toHaveAttribute("aria-describedby", `book-${id}-error`);
    }
    await expect(page.locator("#book-description")).not.toHaveAttribute("aria-required", "true");
  });

  test("an over-limit description is flagged while typing, before submit", async ({ page }) => {
    await page.goto("/books/create");
    await expect(page.locator("#book-description")).toBeVisible();
    await page.locator("#book-description").fill("x".repeat(1001));
    await expect(page.getByText("Description must be at most 1,000 characters")).toBeVisible();
    await expect(page.getByText("1,001 / 1,000")).toHaveClass(/form-error/);
  });
});
