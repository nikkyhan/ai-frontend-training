import { defineConfig, devices } from "@playwright/test";

// Test your local code by default. Set PLAYWRIGHT_BASE_URL to test another server.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const isLocal = baseURL.startsWith("http://localhost");
const runMutations = process.env.E2E_MUTATION === "true";

export default defineConfig({
  testDir: "./e2e",
  // create/edit/delete tests only run when asked (npm run test:e2e:mutation)
  testIgnore: runMutations ? [] : ["**/*.mutation.spec.ts"],
  // one worker: tests share one backend, and dev mode compiles each page on first visit
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Start backend-go and the Next.js dev server if they are not already running
  webServer: isLocal
    ? [
        {
          command: "go run ./cmd/server",
          cwd: "../backend-go",
          url: "http://localhost:8080/health",
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          command: "npm run dev",
          url: `${baseURL}/books/list`,
          reuseExistingServer: true,
          timeout: 180_000,
        },
      ]
    : undefined,
});
