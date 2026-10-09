// Figma ↔ app visual comparison.
// For every PNG exported from Figma (../figma), opens the same page / state in the running
// app at the same width, saves a screenshot, and writes a side-by-side image
// (left: Figma, right: app) plus a pixel-difference score.
//
// Two export formats are supported:
//  - single frames:      "Books List · Light · 1440.png"
//  - comparison boards:  "Books list · 1440px comparison.png", "Books edit/12 · 375px comparison.png"
//    (design panel + old screenshot side by side) — the design panel is cut out automatically.
//
// Usage (backend on :8080 and frontend on :3000 must be running):
//   node scripts/figma-compare.mjs [filter]
// Output: docs/figma-compare/{app,side-by-side}/*.png and docs/figma-compare/report.md
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIGMA_DIR = join(ROOT, "..", "figma");
const OUT = join(ROOT, "docs", "figma-compare");
const BASE = process.env.COMPARE_BASE_URL ?? "http://localhost:3000";
const filter = process.argv[2] ?? "";

// Book shown in the Figma details / edit frames
const DETAIL_TITLE = "A Brief History of Time";

// ---- Page states ----
async function waitForList(page) {
  await page.locator(".book-title-link:visible").first().waitFor();
}
const STATES = {
  list: { path: "/books/list", ready: waitForList },
  create: { path: "/books/create", ready: (p) => p.locator("#book-title").waitFor() },
  details: { path: "detail", ready: (p) => p.locator(".book-details-grid").waitFor() },
  edit: { path: "edit", ready: (p) => p.locator("#book-title").waitFor() },
  loading: {
    path: "/books/list",
    route: (page) => page.route("**/api/v1/books?**", () => {}), // never answers
    ready: (p) => p.locator(".book-list-loading").waitFor(),
  },
  error: {
    path: "/books/list",
    route: (page) =>
      page.route("**/api/v1/books?**", (r) =>
        r.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ statusCode: 503, message: "Simulated read-only capture: service unavailable" }),
        }),
      ),
    ready: (p) => p.getByText("Could not load books").waitFor({ timeout: 20_000 }),
  },
  emptySearch: {
    path: "/books/list",
    ready: async (p) => {
      await waitForList(p);
      await p.getByLabel("Search books").fill("zzzz-no-matching-book-capture-20261008");
      await p.getByText("No books match your search").waitFor();
    },
  },
  validation: {
    path: "/books/create",
    ready: async (p) => {
      await p.locator("#book-title").waitFor();
      await p.waitForLoadState("networkidle");
      // Retry until React has hydrated and handles the submit
      for (let i = 0; i < 10; i++) {
        await p.getByRole("button", { name: "Create book" }).click();
        if (await p.getByText("Title is required").isVisible()) break;
        await p.waitForTimeout(500);
      }
      await p.getByText("Title is required").waitFor();
      await p.locator("body").click({ position: { x: 5, y: 5 } }); // drop focus ring
    },
  },
};

// "Books list · 1440px comparison.png" or "Books edit/12 · 375px comparison.png"
function parseBoardName(rel) {
  const m = rel.match(/Books (list|create|details|edit)[/ ·0-9]*?(\d+)px comparison\.png$/i);
  if (!m) return null;
  const state = m[1].toLowerCase();
  const width = Number(m[2]);
  return { file: rel, board: true, state, theme: "light", width, slug: `books-${state}-${width}` };
}

// "Books List · Light · 1440 · Empty search.png" → { screen, theme, width, variant }
function parseName(file) {
  if (/comparison\.png$/i.test(file)) return parseBoardName(file);
  const [screen, theme, width, variant] = file.replace(/\.png$/, "").split(" · ");
  if (!theme || !Number(width)) return null; // not a frame (e.g. the specification boards)
  const base = screen.replace("Books ", "").toLowerCase();
  const state =
    variant === "Loading" ? "loading" : variant === "Error" ? "error" : variant === "Empty search" ? "emptySearch"
      : variant === "Validation" ? "validation" : base;
  return { file, state, theme: theme.toLowerCase(), width: Number(width), slug: file.replace(/\.png$/, "").replace(/ · /g, "-").replace(/\s+/g, "-").toLowerCase() };
}

function pngSize(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

async function bookId(title) {
  const api = process.env.COMPARE_API_URL ?? "http://localhost:8080/api/v1";
  const res = await fetch(`${api}/books?search=${encodeURIComponent(title)}`);
  const json = await res.json();
  return json.data[0].id;
}

// Cut the "Design · Editable layers" panel (exactly `width` px wide) out of a comparison board
async function extractDesignPanel(page, boardB64, width) {
  return page.evaluate(
    async ({ boardB64, width }) => {
      const img = await new Promise((res) => {
        const i = new Image();
        i.onload = () => res(i);
        i.src = "data:image/png;base64," + boardB64;
      });
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      const px = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
      const bg = px(2, 2);
      const isBg = (x, y) => { const p = px(x, y); return Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2]) < 10; };
      // top: first row that is solid (non-background at 20 points across the full width) —
      // title text rows above the panel are sparse, the panel's white header is solid
      const probe = (y, left) => {
        if (left + width > c.width) return false;
        for (let k = 0; k < 20; k++) {
          if (isBg(left + 2 + Math.floor((k * (width - 4)) / 19), y)) return false;
        }
        return true;
      };
      let top = -1, left = -1;
      for (let y = 0; y < c.height && top < 0; y++) {
        for (let x = 0; x < 80; x++) {
          if (!isBg(x, y) && probe(y, x)) { top = y; left = x; break; }
        }
      }
      if (top < 0) throw new Error("design panel not found");
      let bottom = top;
      while (bottom < c.height && !(isBg(left + 4, bottom) && isBg(left + Math.floor(width / 2), bottom))) bottom++;
      const out = document.createElement("canvas");
      out.width = width;
      out.height = bottom - top;
      out.getContext("2d").drawImage(img, left, top, width, bottom - top, 0, 0, width, bottom - top);
      return out.toDataURL("image/png").split(",")[1];
    },
    { boardB64, width },
  );
}

// Draw Figma + app side by side in a browser canvas and measure the difference
async function composite(page, figmaB64, appB64) {
  return page.evaluate(
    async ({ figmaB64, appB64 }) => {
      const load = (b64) =>
        new Promise((res) => {
          const i = new Image();
          i.onload = () => res(i);
          i.src = "data:image/png;base64," + b64;
        });
      const [fig, app] = await Promise.all([load(figmaB64), load(appB64)]);
      const GAP = 24, HEAD = 36;
      const c = document.createElement("canvas");
      c.width = fig.width + app.width + GAP;
      c.height = Math.max(fig.height, app.height) + HEAD;
      const g = c.getContext("2d");
      g.fillStyle = "#e5e7eb";
      g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = "#111827";
      g.font = "bold 16px sans-serif";
      g.fillText("Figma", 8, 24);
      g.fillText("App", fig.width + GAP + 8, 24);
      g.drawImage(fig, 0, HEAD);
      g.drawImage(app, fig.width + GAP, HEAD);

      // Pixel difference over the shared area (channel delta > 24 counts as different)
      const w = Math.min(fig.width, app.width), h = Math.min(fig.height, app.height);
      const read = (img) => {
        const k = document.createElement("canvas");
        k.width = w; k.height = h;
        const kg = k.getContext("2d");
        kg.drawImage(img, 0, 0);
        return kg.getImageData(0, 0, w, h).data;
      };
      const a = read(fig), b = read(app);
      let diff = 0;
      for (let i = 0; i < a.length; i += 4) {
        if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 24) diff++;
      }
      return { png: c.toDataURL("image/png").split(",")[1], diffPct: (100 * diff) / (w * h), appH: app.height, figH: fig.height };
    },
    { figmaB64, appB64 },
  );
}

async function main() {
  mkdirSync(join(OUT, "app"), { recursive: true });
  mkdirSync(join(OUT, "side-by-side"), { recursive: true });
  const { readdirSync } = await import("node:fs");
  const frames = readdirSync(FIGMA_DIR, { recursive: true })
    .map((f) => String(f).replace(/\\/g, "/"))
    .filter((f) => f.startsWith("Books ") && f.endsWith(".png") && f.includes(filter))
    .map(parseName)
    .filter(Boolean);
  const id = await bookId(DETAIL_TITLE);

  const browser = await chromium.launch();
  const canvasPage = await browser.newPage();
  const rows = [];

  for (const fr of frames) {
    let figmaBuf = readFileSync(join(FIGMA_DIR, fr.file));
    if (fr.board) figmaBuf = Buffer.from(await extractDesignPanel(canvasPage, figmaBuf.toString("base64"), fr.width), "base64");
    mkdirSync(join(OUT, "figma"), { recursive: true });
    writeFileSync(join(OUT, "figma", `${fr.slug}.png`), figmaBuf);
    const { h: figH } = pngSize(figmaBuf);
    const ctx = await browser.newContext({ viewport: { width: fr.width, height: figH } });
    const page = await ctx.newPage();
    const theme = fr.theme;
    await page.addInitScript((t) => localStorage.setItem("books-admin-theme", t), theme);
    const st = STATES[fr.state];
    if (st.route) await st.route(page);
    const path = st.path === "detail" ? `/books/details/${id}` : st.path === "edit" ? `/books/edit/${id}` : st.path;
    await page.goto(BASE + path);
    await st.ready(page);
    await page.waitForTimeout(400); // let fonts / transitions settle
    const appBuf = await page.screenshot({ fullPage: true });
    writeFileSync(join(OUT, "app", `${fr.slug}.png`), appBuf);
    const r = await composite(canvasPage, figmaBuf.toString("base64"), appBuf.toString("base64"));
    writeFileSync(join(OUT, "side-by-side", `${fr.slug}.png`), Buffer.from(r.png, "base64"));
    rows.push({ ...fr, diffPct: r.diffPct, appH: r.appH, figH: r.figH });
    console.log(`${r.diffPct.toFixed(2).padStart(6)}%  height figma ${r.figH} / app ${r.appH}  ${fr.file}`);
    await ctx.close();
  }
  await browser.close();

  // Markdown report
  const lines = [
    "# Figma ↔ app comparison",
    "",
    `Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/figma-compare.mjs\` against ${BASE}.`,
    "Difference = share of pixels (shared area) whose colour differs noticeably. Lower is closer.",
    "",
    "| Frame | Diff | Height (Figma / app) | Side-by-side |",
    "|---|---|---|---|",
    ...rows.map((r) => `| ${r.file.replace(".png", "")} | ${r.diffPct.toFixed(2)}% | ${r.figH} / ${r.appH} | [image](side-by-side/${r.slug}.png) |`),
    "",
  ];
  writeFileSync(join(OUT, "report.md"), lines.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
