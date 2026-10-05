import { expect, test, type Page } from "@playwright/test";

// WM breakpoints. Each page is checked for sideways scrolling and screenshotted
// to docs/screenshots/ for the homework submission.
const WIDTHS = [1920, 1600, 1366, 1280, 1024, 991, 768, 640, 480, 375];
const HEIGHT = 900;

const PAGES = [
  { name: "books-list", path: "/books/list", ready: ".book-title-link:visible" },
  { name: "books-create", path: "/books/create", ready: "#book-title" },
  { name: "books-details", path: "/books/details/1", ready: ".book-details-grid" },
];

async function pageScrollsSideways(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
}

// Dark mode: same token names, night values (WM Light/Dark rule)
test.describe("Dark mode", () => {
  for (const width of [1366, 375]) {
    test(`books list in dark mode at ${width}px`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("books-admin-theme", "dark"));
      await page.setViewportSize({ width, height: HEIGHT });
      await page.goto("/books/list");
      await expect(page.locator(".book-title-link:visible").first()).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      expect(await pageScrollsSideways(page)).toBe(false);
      await page.screenshot({ path: `docs/screenshots/dark-books-list-${width}.png`, fullPage: true });
    });
  }
});

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
