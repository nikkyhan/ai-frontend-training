import { expect, type Page } from "@playwright/test";

/** Data rows of the book table (excludes the "empty" row). */
export const bookRows = (page: Page) => page.locator(".p-datatable-tbody > tr:not(.p-datatable-emptymessage)");

/** Opens the list and waits until real rows (not skeletons) are shown. */
export async function openBookList(page: Page) {
  await page.goto("/books/list");
  await expect(page.getByRole("heading", { name: "Books", level: 1 })).toBeVisible();
  await expect(page.locator(".book-title-link").first()).toBeVisible();
}

/** Types into a PrimeReact InputNumber (needs real key presses, not fill). */
export async function typeNumber(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await input.click();
  await input.press("Control+a");
  await input.press("Backspace");
  await input.pressSequentially(value);
  await input.blur();
}

/** Picks an option from a PrimeReact Dropdown by its label. */
export async function selectDropdown(page: Page, triggerSelector: string, option: string) {
  await page.locator(triggerSelector).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
