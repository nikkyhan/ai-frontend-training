import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}

/** Title row used at the top of every page. */
export function PageHeader({ title, subtitle, backHref, backLabel = "Back", actions }: PageHeaderProps) {
  return (
    <>
      {backHref && (
        <Link href={backHref} className="back-link">
          <i className="pi pi-arrow-left" aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </>
  );
}
