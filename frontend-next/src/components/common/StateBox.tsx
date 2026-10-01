import type { ReactNode } from "react";

interface StateBoxProps {
  icon: string;
  title: string;
  text?: string;
  tone?: "default" | "error";
  action?: ReactNode;
}

/** Centered message for empty and error states. */
export function StateBox({ icon, title, text, tone = "default", action }: StateBoxProps) {
  return (
    <div className={`state-box${tone === "error" ? " is-error" : ""}`} role={tone === "error" ? "alert" : "status"}>
      <i className={`pi ${icon}`} aria-hidden="true" />
      <p className="state-title">{title}</p>
      {text && <p className="state-text">{text}</p>}
      {action}
    </div>
  );
}
