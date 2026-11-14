import { Link } from "wouter";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="ResearchMatch home"
    >
      <span className="brand-symbol" aria-hidden="true">
        r<span>↗</span>
      </span>
      <span>
        ResearchMatch
        <span className="brand-caption">MADE FOR USC DISCOVERY</span>
      </span>
    </Link>
  );
}
