import type { ReactNode } from "react";
import { HardDrive } from "lucide-react";

/** Honest scope label: what is browser-local, fictional, or not delivered. */
export function LocalNotice({ children }: { children: ReactNode }) {
  return (
    <p
      data-testid="text-local-notice"
      className="flex items-start gap-2 border border-chart-2/40 bg-accent/60 px-3 py-2 text-xs text-accent-foreground"
    >
      <HardDrive className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function ProjectSelect({
  projects,
  value,
  onChange,
  label = "Ranking against",
}: {
  projects: { id: string; title: string }[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  return (
    <label className="block font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
      {label}
      <select
        data-testid="select-project"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-11 w-full border border-primary/25 bg-background px-3 font-sans text-sm normal-case tracking-normal text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>
    </label>
  );
}
