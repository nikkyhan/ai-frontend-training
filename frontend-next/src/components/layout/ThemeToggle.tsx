"use client";

import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { applyTheme, THEME_STORAGE_KEY, type ThemeMode } from "./theme";

/** Button that switches light ↔ dark and remembers the choice. */
export function ThemeToggle() {
  // null until mounted: the server does not know the user's theme
  const [mode, setMode] = useState<ThemeMode | null>(null);

  // Read the theme the init script already applied
  useEffect(() => {
    setMode(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage blocked (private mode) — theme still changes for this visit
    }
    setMode(next);
  };

  const label = mode === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <Button
      type="button"
      className="theme-toggle icon-button"
      icon={mode === "dark" ? "pi pi-sun" : "pi pi-moon"}
      rounded
      text
      aria-label={label}
      tooltip={label}
      tooltipOptions={{ position: "bottom" }}
      onClick={toggle}
    />
  );
}
