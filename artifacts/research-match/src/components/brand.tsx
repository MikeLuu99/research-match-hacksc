import { Link } from "wouter";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="LABBE home"
    >
      <img src="/logo.svg" alt="" className="brand-logo" aria-hidden="true" />
      <span>
        LABBE
        <span className="brand-caption">USC RESEARCH DISCOVERY</span>
      </span>
    </Link>
  );
}
