// Copies the PrimeReact light and dark themes into public/themes so the app can
// switch between them at runtime by changing one <link> tag (see ThemeToggle).
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "primereact", "resources", "themes");
const dest = join(root, "public", "themes");

if (!existsSync(src)) {
  console.warn("[copy-themes] primereact not installed yet, skipping");
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
for (const theme of ["lara-light-blue", "lara-dark-blue"]) {
  cpSync(join(src, theme), join(dest, theme), { recursive: true });
}
console.log("[copy-themes] copied PrimeReact themes to public/themes");
