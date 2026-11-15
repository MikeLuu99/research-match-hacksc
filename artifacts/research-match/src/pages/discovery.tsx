import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight, Search, X, ArrowUpRight } from "lucide-react";
import { Layout, EmptyState } from "@/components/layout";
import { AiMatches } from "@/components/ai-matches";
import { SetupChecklist } from "@/components/setup-checklist";
import { useAccount } from "@/lib/auth";
import { RecruitPill, ProjectGrid } from "@/components/bits";
import { ProjectDialog } from "@/components/project-dialog";
import { useStore } from "@/lib/store";
import { matchProject } from "@/lib/matching";
import { DEPARTMENTS, type Project, type RecruitStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

type Sort = "match" | "hours" | "title";

function Chip({ on, onClick, children, id, size = "sm" }: { on: boolean; onClick: () => void; children: ReactNode; id: string; size?: "sm" | "lg" }) {
  return (
    <button
      data-testid={`filter-${id}`}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-200",
        on ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary/40 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

export default function Discovery() {
  const account = useAccount();
  const { projects, profile } = useStore();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  // Chips are filters: nothing toggled = the full catalog. Selecting one or
  // more status chips shows only those statuses.
  const [statuses, setStatuses] = useState<RecruitStatus[]>([]);
  const [paid, setPaid] = useState(false);
  const [credit, setCredit] = useState(false);
  const [beginner, setBeginner] = useState(false);
  const [sort, setSort] = useState<Sort>("match");
  const [open, setOpen] = useState<Project | null>(null);
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);

  const scored = useMemo(() => projects.map((p) => ({ p, m: matchProject(profile, p) })), [projects, profile]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return scored
      .filter(
        ({ p }) =>
          statuses.length === 0 || statuses.includes(p.status),
      )
      .filter(({ p }) => dept === "all" || p.department === dept)
      .filter(({ p }) => !paid || p.paid)
      .filter(({ p }) => !credit || p.credit)
      .filter(({ p }) => !beginner || p.level === "beginner")
      .filter(({ p }) => !t || [p.title, p.summary, p.lab, p.department, ...p.requiredSkills, ...p.niceSkills, ...p.keywords].join(" ").toLowerCase().includes(t))
      .sort((a, b) => (sort === "match" ? b.m.score - a.m.score : sort === "hours" ? a.p.minHours - b.p.minHours : a.p.title.localeCompare(b.p.title)));
  }, [scored, q, dept, statuses, paid, credit, beginner, sort]);

  const depts = Array.from(new Set([...DEPARTMENTS, ...projects.map((p) => p.department)]));
  const toggleStatus = (s: RecruitStatus) => setStatuses((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]));
  const clear = () => {
    setQ("");
    setDept("all");
    setStatuses([]);
    setPaid(false);
    setCredit(false);
    setBeginner(false);
  };
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  void currentPage;
  const openCount = scored.filter(({ p }) => p.status === "open").length;

  // Reset to the first page whenever any filter input changes.
  useEffect(() => {
    setPage(1);
  }, [q, dept, statuses, paid, credit, beginner, sort]);

  return (
    <Layout>
      <section className="px-5 md:px-10 pt-8 md:pt-12 pb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Discover · USC research</p>
        <h1 className="font-display text-3xl md:text-4xl leading-[1.05] mt-2 mb-6">
          AI matches for <em className="text-primary not-italic underline decoration-chart-2 decoration-4 underline-offset-[6px]">your profile</em>
        </h1>
        <div className="rise space-y-4">
          {account.isAuthenticated && account.viewer?.accountType === "student" && (
            <SetupChecklist />
          )}
          <AiMatches />
        </div>
      </section>

            <section className="sticky top-0 z-20 bg-background/90 backdrop-blur border-y px-5 md:px-10 py-3 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              data-testid="input-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search topics, skills, labs — try 'clinical' or 'robotics'"
              className="w-full h-11 rounded-xl border bg-card pl-10 pr-9 text-[15px] outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 transition"
            />
            {q && <button data-testid="button-clear-search" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </label>
          <select data-testid="select-department" value={dept} onChange={(e) => setDept(e.target.value)} className="h-11 rounded-xl border bg-card px-3 text-[15px] hover:border-primary/40 transition">
            <option value="all">All departments</option>
            {depts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select data-testid="select-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-11 rounded-xl border bg-card px-3 text-[15px] hover:border-primary/40 transition">
            <option value="match">Sort: best match</option>
            <option value="hours">Sort: fewest hours</option>
            <option value="title">Sort: A-Z</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Chip id="open" on={statuses.includes("open")} onClick={() => toggleStatus("open")}>Open recruiting</Chip>
          <Chip id="exploration" on={statuses.includes("exploration")} onClick={() => toggleStatus("exploration")}>Lab exploration</Chip>
          <Chip id="closed" on={statuses.includes("closed")} onClick={() => toggleStatus("closed")}>Show closed</Chip>
          <span className="w-px h-6 bg-border mx-1" />
          <Chip id="paid" on={paid} onClick={() => setPaid(!paid)}>Paid</Chip>
          <Chip id="credit" on={credit} onClick={() => setCredit(!credit)}>Academic credit</Chip>
          <Chip id="beginner" on={beginner} onClick={() => setBeginner(!beginner)}>Beginner friendly</Chip>
          <span className="ml-auto text-sm text-muted-foreground font-mono" data-testid="text-result-count">{list.length} of {projects.length}</span>
        </div>
      </section>

      <section className="px-5 md:px-10 py-8 grid xl:grid-cols-[1fr_280px] gap-8">
        <div>
          {list.length ? (
            <>
              <ProjectGrid
                list={list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
                onOpen={setOpen}
                className="md:grid-cols-2"
              />
              {pageCount > 1 && (
                <nav
                  aria-label="Catalog pages"
                  className="mt-6 flex items-center justify-center gap-2"
                >
                  <button
                    data-testid="button-prev-page"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                    className="border border-primary/25 px-3 py-2 text-primary hover:bg-primary/5 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                    (number) => (
                      <button
                        key={number}
                        data-testid={`button-page-${number}`}
                        onClick={() => setPage(number)}
                        className={
                          number === page
                            ? "h-9 w-9 bg-primary font-mono text-sm text-primary-foreground"
                            : "h-9 w-9 border border-primary/25 font-mono text-sm text-primary hover:bg-primary/5"
                        }
                      >
                        {number}
                      </button>
                    ),
                  )}
                  <button
                    data-testid="button-next-page"
                    disabled={page === pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    aria-label="Next page"
                    className="border border-primary/25 px-3 py-2 text-primary hover:bg-primary/5 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </nav>
              )}
            </>
          ) : (
            <EmptyState
              title="No labs fit those filters"
              body="Try widening the department or turning off a preference. Research often lives somewhere unexpected."
              action={<button data-testid="button-clear-filters" onClick={clear} className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90">Clear filters</button>}
            />
          )}
        </div>
        <aside className="space-y-4 xl:sticky xl:top-36 self-start">
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-primary font-semibold">How ranking works</p>
            <p className="font-mono text-[11px] mt-1 rounded bg-accent text-accent-foreground inline-block px-1.5">Skill + interest matching</p>
            <ul className="mt-3 text-sm space-y-2 text-foreground/80">
              <li><b className="font-mono text-xs text-primary">40%</b> cosine similarity of local word-count vectors</li>
              <li><b className="font-mono text-xs text-primary">35%</b> required-skill coverage (softened for beginner labs)</li>
              <li><b className="font-mono text-xs text-primary">15%</b> hours fit</li>
              <li><b className="font-mono text-xs text-primary">10%</b> credit / pay preference</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">Local text vectors computed in your browser, not live AI embeddings. Ineligible majors are halved.</p>
            <Link href="/settings" data-testid="link-matching-details" className="text-xs text-primary font-medium mt-2 inline-block hover:underline">Method details</Link>
          </div>
          <div className="rounded-2xl border bg-secondary/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">Legend</p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2"><RecruitPill status="open" /> accepting interest</div>
              <div className="flex items-center gap-2"><RecruitPill status="exploration" /> meet the lab first</div>
              <div className="flex items-center gap-2"><RecruitPill status="closed" /> save only</div>
            </div>
          </div>
          <Link href="/profile" data-testid="link-edit-profile" className="lift block rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold">Results feel off?</p>
            <p className="text-xs text-muted-foreground mt-1">Edit skills, interests and hours — rankings update instantly.</p>
          </Link>
        </aside>
      </section>
      <ProjectDialog project={open} onClose={() => setOpen(null)} />
    </Layout>
  );
}
