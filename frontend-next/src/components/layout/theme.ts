// Light/dark theme helpers shared by the root layout and ThemeToggle.

export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "books-admin-theme";
export const THEME_LINK_ID = "theme-link";

export const PRIME_THEME_HREF: Record<ThemeMode, string> = {
  light: "/themes/lara-light-blue/theme.css",
  dark: "/themes/lara-dark-blue/theme.css",
};

/** Sets data-theme on <html> and swaps the PrimeReact theme stylesheet. */
export function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  const link = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;
  if (link) link.href = PRIME_THEME_HREF[mode];
}

/**
 * Inline script run before React. It picks the saved (or OS) theme, sets data-theme,
 * and creates the PrimeReact theme <link> itself. React never renders that <link>,
 * so changing it can't cause a hydration mismatch.
 */
export const THEME_INIT_SCRIPT = `(function(){
var m="light";
try{m=localStorage.getItem("${THEME_STORAGE_KEY}")||"";}catch(e){}
if(m!=="light"&&m!=="dark"){m=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
document.documentElement.dataset.theme=m;
if(!document.getElementById("${THEME_LINK_ID}")){
var l=document.createElement("link");l.id="${THEME_LINK_ID}";l.rel="stylesheet";
l.href=m==="dark"?"${PRIME_THEME_HREF.dark}":"${PRIME_THEME_HREF.light}";
document.head.appendChild(l);}
})();`;
