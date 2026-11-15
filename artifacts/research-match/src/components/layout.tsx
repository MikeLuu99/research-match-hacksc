import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Compass,
  Bookmark,
  Send,
  UserRound,
  FlaskConical,
  Settings2,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useAccount } from "@/lib/auth";

const NAV = [
  { href: "/student", label: "Discover", icon: Compass, roles: ["student"] },
  { href: "/saved", label: "Saved", icon: Bookmark, roles: ["student"] },
  { href: "/applications", label: "Interest tracker", icon: Send, roles: ["student"] },
  { href: "/profile", label: "My profile", icon: UserRound, roles: ["student"] },
  { href: "/faculty", label: "Faculty workspace", icon: FlaskConical, roles: ["faculty"] },
  { href: "/settings", label: "Data & matching", icon: Settings2, roles: ["faculty"] },
];

function LogOutButton({ subtle = false }: { subtle?: boolean }) {
  const account = useAccount();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  if (!account.isAuthenticated) return null;
  return (
    <div>
      <button
        data-testid="button-logout"
        disabled={signingOut}
        onClick={async () => {
          setSignOutError(false);
          setSigningOut(true);
          try {
            await account.signOut();
          } catch {
            setSignOutError(true);
          } finally {
            setSigningOut(false);
          }
        }}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap transition-colors duration-200 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 disabled:opacity-50",
          subtle && "w-full",
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>{signingOut ? "Signing out…" : "Log out"}</span>
      </button>
      {signOutError && (
        <p role="alert" className="px-3 text-[11px] text-sidebar-primary">
          Couldn’t sign out. Please try again.
        </p>
      )}
    </div>
  );
}

function AccountMenu() {
  const account = useAccount();
  return <div className="mt-3 flex flex-wrap items-center justify-between gap-3 md:block">
    <Link href="~/" className="flex items-center gap-2 md:hidden"><ArrowLeft size={14} />LABBE home</Link>
          {!account.isAuthenticated && (
            <Link href="~/sign-up" className="block md:mt-4 text-primary md:text-sidebar-primary">
              Create your account ↗
            </Link>
          )}
  </div>;
}

export function Layout({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const { saved, interests, profile } = useStore();
  const account = useAccount();
  // Signed-in accounts see only their side's tools. The unauthenticated demo
  // shows both sides so visitors can explore each workflow.
  const role = account.isAuthenticated
    ? account.viewer?.accountType ?? "student"
    : "demo";
  const mine = interests.filter((i) => i.studentId === profile.id).length;
  const counts: Record<string, number> = {
    "/saved": saved.length,
    "/applications": mine,
  };
  const nav = NAV.filter(
    (n) => role === "demo" || n.roles.includes(role),
  );
  return (
    <div className="workspace-grid min-h-[100dvh] md:flex">
      <aside className="md:w-64 md:min-h-[100dvh] bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-[100dvh] flex md:flex-col border-r border-sidebar-border">
        <div className="hidden md:block px-6 pt-7 pb-6">
          <Link href="/" className="block group" data-testid="link-home">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="" className="h-8 w-8 object-contain transition-colors" />
              <span className="font-display text-2xl">LABBE</span>
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/60">
              Demo · not an official USC product
            </p>
          </Link>
        </div>
        <nav className="flex md:flex-col gap-0 px-2 md:px-3 py-2 overflow-x-auto w-full">
          {nav.map((n) => {
            const active =
              n.href === "/" ? loc === "/" : loc.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                data-testid={`link-nav-${n.href.replace("/", "") || "discover"}`}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap transition-colors duration-200",
                  active
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-sidebar-primary hidden md:block" />
                )}
                <n.icon className="h-4 w-4 shrink-0" />
                <span>{n.label}</span>
                {counts[n.href] ? (
                  <span className="ml-auto font-mono text-[11px] bg-sidebar-primary text-sidebar-primary-foreground px-1.5">
                    {counts[n.href]}
                  </span>
                ) : null}
              </Link>
            );
          })}
          <LogOutButton />
        </nav>
        <div className="hidden md:block mt-auto p-5 text-xs text-sidebar-foreground/60 leading-relaxed">
          <Link
            href="~/"
            className="mb-4 flex items-center gap-2 text-sidebar-foreground"
          >
            <ArrowLeft size={14} />
            LABBE home
          </Link>
          <p>
            Lab listings come from public USC research pages (checked Nov
            2026). Workspace changes are stored in this browser.
          </p>
          <AccountMenu />
        </div>
      </aside>
      <main className="flex-1 min-w-0"><div className="px-5 pb-3 text-xs border-b md:hidden"><AccountMenu /></div>{children}</main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="px-5 md:px-10 pt-8 md:pt-12 pb-6 rise">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
        <span className="h-[7px] w-[7px] bg-chart-2" />
        {eyebrow}
      </p>
      <h1 className="font-display text-3xl md:text-5xl mt-2 leading-[1.05]">
        {title}
      </h1>
      {children && (
        <div className="mt-3 text-muted-foreground max-w-2xl">{children}</div>
      )}
    </header>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-primary/30 bg-card/60 px-6 py-14 text-center rise">
      <div className="mx-auto mb-4 h-14 w-14 border border-dashed border-primary/40 grid place-items-center">
        <span className="h-3 w-3 bg-chart-2" />
      </div>
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        {body}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
