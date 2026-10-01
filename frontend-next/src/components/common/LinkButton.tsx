import Link from "next/link";

interface LinkButtonProps {
  href: string;
  label: string;
  icon?: string;
  outlined?: boolean;
}

/** A Next.js link that looks like a PrimeReact button (avoids nesting <button> inside <a>). */
export function LinkButton({ href, label, icon, outlined }: LinkButtonProps) {
  return (
    <Link href={href} className={`p-button p-component${outlined ? " p-button-outlined" : ""}`}>
      {icon && <span className={`p-button-icon p-button-icon-left ${icon}`} aria-hidden="true" />}
      <span className="p-button-label">{label}</span>
    </Link>
  );
}
