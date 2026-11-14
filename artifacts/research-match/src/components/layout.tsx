import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Compass, Bookmark, Send, UserRound, FlaskConical, Settings2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/applications", label: "Interest tracker", icon: Send },
  { href: "/profile", label: "My profile", icon: UserRound },
  { href: "/faculty", label: "Faculty workspace", icon: FlaskConical },
  { href: "/settings", label: "Data & matching", icon: Settings2 },
];

export function Layout({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const { saved, interests, profile } = useStore();
  const mine = interests.filter((i) => i.studentId === profile.id).length;
  const counts: Record<string, number> = { "/saved": saved.length, "/applications": mine };
  return (
    <div className="grain min-h-[100dvh] md:flex">
      <aside className="md:w-64 md:min-h-[100dvh] bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-[100dvh] flex md:flex-col">
        <div className="hidden md:block px-6 pt-7 pb-6">
          <Link href="/" className="block group" data-testid="link-home">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center font-display text-lg font-bold transition-transform group-hover:rotate-12">r</span>
              <span className="font-display text-2xl">ResearchMatch</span>
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60">Demo · not an official USC product</p>
          </Link>
        </div>
        <nav className="flex md:flex-col gap-1 px-2 md:px-3 py-2 overflow-x-auto w-full">
          {NAV.map((n) => {
            const active = n.href === "/" ? loc === "/" : loc.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                data-testid={`link-nav-${n.href.replace("/", "") || "discover"}`}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm whitespace-nowrap transition-all duration-200",
                  active ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 hover:translate-x-0.5",
                )}
              >
                {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-sidebar-primary hidden md:block" />}
                <n.icon className="h-4 w-4 shrink-0" />
                <span>{n.label}</span>
                {counts[n.href] ? (
                  <span className="ml-auto text-[11px] font-mono rounded-full bg-sidebar-primary/90 text-sidebar-primary-foreground px-1.5">{counts[n.href]}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="hidden md:block mt-auto p-5 text-xs text-sidebar-foreground/60 leading-relaxed">
          Everything here is fictional demo data, stored only in this browser.
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="px-5 md:px-10 pt-8 md:pt-12 pb-6 rise">
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">{eyebrow}</p>
      <h1 className="font-display text-3xl md:text-5xl mt-2 leading-[1.05]">{title}</h1>
      {children && <div className="mt-3 text-muted-foreground max-w-2xl">{children}</div>}
    </header>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-primary/25 bg-card/60 px-6 py-14 text-center rise">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full border-2 border-dashed border-accent-foreground/30 grid place-items-center">
        <span className="h-3 w-3 rounded-full bg-chart-2" />
      </div>
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
