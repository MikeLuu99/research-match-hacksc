import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  MessageCircleQuestion,
  PanelLeftClose,
  PanelLeftOpen,
  Compass,
  Bookmark,
  Send,
  UserRound,
  FlaskConical,
  LogOut,
  ArrowLeft,
  Users,
  ListChecks,
  Inbox,
  GraduationCap,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex-api";
import { cn } from "@/lib/utils";
import { useAccount } from "@/lib/auth";

type NavItem = { href: string; label: string; icon: typeof Compass };

const STUDENT_NAV: NavItem[] = [
  { href: "/student", label: "Discover", icon: Compass },
  { href: "/ask", label: "Ask LABBE AI", icon: MessageCircleQuestion },
  { href: "/ask", label: "Ask LABBE", icon: MessageCircleQuestion },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/applications", label: "Interest tracker", icon: Send },
];

const FACULTY_NAV: NavItem[] = [
  { href: "/faculty", label: "Lab workspace", icon: FlaskConical },
  { href: "/faculty/discover", label: "Discover students", icon: Users },
  { href: "/faculty/shortlist", label: "Student shortlist", icon: ListChecks },
  { href: "/faculty/inbox", label: "Interest inbox", icon: Inbox },
];

const BOTTOM_PROFILE: Record<"student" | "faculty", NavItem> = {
  student: { href: "/profile", label: "Student profile", icon: UserRound },
  faculty: { href: "/faculty/profile", label: "Faculty profile", icon: GraduationCap },
};

// Demo-only view switch. Signed-in accounts keep their single role.
function DemoViewSwitch({ view, collapsed }: { view: "student" | "faculty"; collapsed: boolean }) {
  if (collapsed) return null;
  const item = (href: string, label: string, on: boolean) => (
    <Link
      href={href}
      data-testid={`link-view-${label.toLowerCase()}`}
      aria-current={on ? "page" : undefined}
      className={cn(
        "flex-1 px-3 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
        on
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
      )}
    >
      {label}
    </Link>
  );
  return (
    <div className="mx-2 md:mx-3 mb-2 flex border border-sidebar-border shrink-0" role="group" aria-label="Demo view">
      {item("/student", "Student", view === "student")}
      {item("/faculty", "Faculty", view === "faculty")}
    </div>
  );
}


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
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("labbe.sidebarCollapsed") === "1";
    } catch {
      return false;
    }
  });

  function toggleCollapsed() {
    setCollapsed((value) => {
      try {
        localStorage.setItem("labbe.sidebarCollapsed", value ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !value;
    });
  }
  const [loc] = useLocation();
  const { saved, interests, profile, projects, shortlists } = useStore();
  const account = useAccount();
  // Signed-in accounts see only their side's tools. The unauthenticated demo
  // shows both sides so visitors can explore each workflow.
  const role = account.isAuthenticated
    ? account.viewer?.accountType ?? "student"
    : "demo";
  // Badges use the real pipeline for signed-in accounts; the browser-local
  // store only feeds the unauthenticated demo.
  const liveStudent =
    account.isAuthenticated &&
    account.viewer?.accountType === "student" &&
    account.viewer.hasStudentProfile;
  const liveFaculty =
    account.isAuthenticated && account.viewer?.accountType === "faculty";
  const liveInterests = useQuery(
    api.interests.myInterests,
    liveStudent ? {} : "skip",
  );
  const liveInbox = useQuery(api.interests.labInbox, liveFaculty ? {} : "skip");
  const mine = liveStudent
    ? (liveInterests ?? []).filter((i) => i.status !== "withdrawn").length
    : interests.filter((i) => i.studentId === profile.id).length;
  const counts: Record<string, number> = {
    "/saved": saved.length,
    "/applications": mine,
    "/faculty/shortlist": liveFaculty
      ? 0
      : projects.reduce((n, p) => n + (shortlists[p.id] ?? []).length, 0),
    "/faculty/inbox": liveFaculty
      ? (liveInbox ?? []).length
      : interests.filter(
          (i) =>
            i.status === "interested" &&
            projects.some((p) => p.id === i.projectId),
        ).length,
  };
  const view: "student" | "faculty" =
    role === "demo"
      ? loc.startsWith("/faculty") || loc.startsWith("/settings")
        ? "faculty"
        : "student"
      : role === "faculty"
        ? "faculty"
        : "student";
  const nav = view === "faculty" ? FACULTY_NAV : STUDENT_NAV;
  const navLink = (n: NavItem) => {
    const active =
      n.href === "/faculty" ? loc === "/faculty" : loc.startsWith(n.href);
    return (
      <Link
        key={n.href}
        href={n.href}
        title={collapsed ? n.label : undefined}
        data-testid={`link-nav-${n.href.slice(1).replace("/", "-") || "discover"}`}
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
        {!collapsed && <span>{n.label}</span>}
        {counts[n.href] ? (
          <span className="ml-auto font-mono text-[11px] bg-sidebar-primary text-sidebar-primary-foreground px-1.5">
            {counts[n.href]}
          </span>
        ) : null}
      </Link>
    );
  };
  return (
    <div className="workspace-grid min-h-[100dvh] md:flex">
      <aside
        className={cn(
          "md:min-h-[100dvh] bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-[100dvh] flex md:flex-col border-r border-sidebar-border transition-all duration-200",
          collapsed ? "md:w-16" : "md:w-64",
        )}
      >
        <div className="hidden md:flex items-start justify-between px-4 pt-7 pb-6">
          <div data-testid="link-home">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="" className="h-8 w-8 object-contain transition-colors" />
              {!collapsed && (
                <span className="font-display text-2xl">LABBE</span>
              )}
            </div>
            {!collapsed && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/60">
                Demo · not an official USC product
              </p>
            )}
          </div>
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapsed}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        {role === "demo" && (
          <div className="hidden md:block">
            <DemoViewSwitch view={view} collapsed={collapsed} />
          </div>
        )}
        <nav
          aria-label={view === "faculty" ? "Faculty" : "Student"}
          className="flex md:flex-col gap-0 px-2 md:px-3 py-2 overflow-x-auto w-full md:flex-1"
        >
          {role === "demo" && (
            <div className="md:hidden flex shrink-0">
              <DemoViewSwitch view={view} collapsed={false} />
            </div>
          )}
          {nav.map(navLink)}
          <div
            className={cn(
              "md:border-t md:border-sidebar-border md:pt-2",
              view !== "student" && "md:mt-auto",
            )}
          >
            {navLink(BOTTOM_PROFILE[view])}
          </div>
          <LogOutButton />
        </nav>
        <div className="hidden md:block p-5 text-xs text-sidebar-foreground/60 leading-relaxed">
          <Link
            href="~/"
            className={cn(
              "flex items-center gap-2 text-sidebar-foreground",
              !collapsed && "mb-4",
            )}
          >
            <ArrowLeft size={14} />
            {!collapsed && "LABBE home"}
          </Link>
          {!collapsed && (
            <p>
              Lab listings come from public USC research pages (checked Nov
              2026). Workspace changes are stored in this browser and are not synced.
            </p>
          )}
          {!collapsed && <AccountMenu />}
          {collapsed && <LogOutButton />}
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
