import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, X, ArrowUpRight } from "lucide-react";
import { Layout, EmptyState } from "@/components/layout";
import { RecruitPill, ProjectGrid } from "@/components/bits";
import { ProjectDialog } from "@/components/project-dialog";
import { useStore } from "@/lib/store";
import { matchProject } from "@/lib/matching";
import { DEPARTMENTS, type Project, type RecruitStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

type Sort = "match" | "hours" | "title";

function Chip({ on, onClick, children, id }: { on: boolean; onClick: () => void; children: ReactNode; id: string }) {
  return (
    <button
      data-testid={`filter-${id}`}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-px",
        on ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card hover:border-primary/40 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

export default function Discovery() {
  const { projects, profile } = useStore();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [statuses, setStatuses] = useState<RecruitStatus[]>(["open", "exploration"]);
  const [paid, setPaid] = useState(false);
  const [credit, setCredit] = useState(false);
  const [beginner, setBeginner] = useState(false);
  const [sort, setSort] = useState<Sort>("match");
  const [open, setOpen] = useState<Project | null>(null);

  const scored = useMemo(() => projects.map((p) => ({ p, m: matchProject(profile, p) })), [projects, profile]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return scored
      .filter(({ p }) => statuses.includes(p.status))
      .filter(({ p }) => dept === "all" || p.department === dept)
      .filter(({ p }) => !paid || p.paid)
      .filter(({ p }) => !credit || p.credit)
      .filter(({ p }) => !beginner || p.level === "beginner")
      .filter(({ p }) => !t || [p.title, p.summary, p.lab, p.department, ...p.requiredSkills, ...p.niceSkills, ...p.keywords].join(" ").toLowerCase().includes(t))
      .sort((a, b) => (sort === "match" ? b.m.score - a.m.score : sort === "hours" ? a.p.minHours - b.p.minHours : a.p.title.localeCompare(b.p.title)));
  }, [scored, q, dept, statuses, paid, credit, beginner, sort]);

  const spotlight = useMemo(
    () => scored.filter(({ p }) => p.department !== profile.major && p.status !== "closed").sort((a, b) => b.m.score - a.m.score)[0],
    [scored, profile.major],
  );
  const depts = Array.from(new Set([...DEPARTMENTS, ...projects.map((p) => p.department)]));
  const toggleStatus = (s: RecruitStatus) => setStatuses((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]));
  const clear = () => { setQ(""); setDept("all"); setStatuses(["open", "exploration"]); setPaid(false); setCredit(false); setBeginner(false); };
  const openCount = scored.filter(({ p }) => p.status === "open").length;

  return (
    <Layout>
      <section className="px-5 md:px-10 pt-8 md:pt-12 pb-8 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-end">
        <div className="rise">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">Discover · demo data</p>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] mt-3">
            Hi {profile.name.split(" ")[0]}. Your skills travel <em className="text-primary not-italic underline decoration-chart-2 decoration-4 underline-offset-[6px]">further</em> than your department.
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl">
            {openCount} labs are recruiting right now. Ranked by demo matching against your {profile.skills.length} skills, interests in {profile.interests.slice(0, 2).join(" and ") || "anything"}, and {profile.hours} h/week.
          </p>
        </div>
        {spotlight && (
          <button
            data-testid="button-spotlight"
            onClick={() => setOpen(spotlight.p)}
            className="lift rise text-left rounded-2xl bg-sidebar text-sidebar-foreground p-6 relative overflow-hidden group"
            style={{ animationDelay: "120ms" }}
          >
            <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[18px] border-sidebar-primary/25 transition-transform duration-500 group-hover:scale-110" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-sidebar-primary font-semibold">Outside your department</p>
            <h2 className="font-display text-2xl mt-2 leading-tight pr-8">{spotlight.p.title}</h2>
            <p className="text-sm text-sidebar-foreground/70 mt-1">{spotlight.p.department}</p>
            <div className="flex items-center gap-3 mt-5">
              <span className="font-mono text-3xl text-sidebar-primary">{Math.round(spotlight.m.score)}</span>
              <span className="text-xs text-sidebar-foreground/70 leading-tight">demo match<br />{spotlight.m.matchedSkills.length}/{spotlight.p.requiredSkills.length} required skills</span>
              <ArrowUpRight className="ml-auto h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </button>
        )}
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
              className="w-full h-11 rounded-xl border bg-card pl-10 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 transition"
            />
            {q && <button data-testid="button-clear-search" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </label>
          <select data-testid="select-department" value={dept} onChange={(e) => setDept(e.target.value)} className="h-11 rounded-xl border bg-card px-3 text-sm hover:border-primary/40 transition">
            <option value="all">All departments</option>
            {depts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select data-testid="select-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-11 rounded-xl border bg-card px-3 text-sm hover:border-primary/40 transition">
            <option value="match">Sort: best match</option>
            <option value="hours">Sort: fewest hours</option>
            <option value="title">Sort: A-Z</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Chip id="open" on={statuses.includes("open")} onClick={() => toggleStatus("open")}>Open recruiting</Chip>
          <Chip id="exploration" on={statuses.includes("exploration")} onClick={() => toggleStatus("exploration")}>Lab exploration</Chip>
          <Chip id="closed" on={statuses.includes("closed")} onClick={() => toggleStatus("closed")}>Show closed</Chip>
          <span className="w-px h-5 bg-border mx-1" />
          <Chip id="paid" on={paid} onClick={() => setPaid(!paid)}>Paid</Chip>
          <Chip id="credit" on={credit} onClick={() => setCredit(!credit)}>Academic credit</Chip>
          <Chip id="beginner" on={beginner} onClick={() => setBeginner(!beginner)}>Beginner friendly</Chip>
          <span className="ml-auto text-xs text-muted-foreground font-mono" data-testid="text-result-count">{list.length} of {projects.length}</span>
        </div>
      </section>

      <section className="px-5 md:px-10 py-8 grid xl:grid-cols-[1fr_280px] gap-8">
        <div>
          {list.length ? (
            <ProjectGrid list={list} onOpen={setOpen} className="md:grid-cols-2" />
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
            <p className="text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">How ranking works</p>
            <p className="font-mono text-[11px] mt-1 rounded bg-accent text-accent-foreground inline-block px-1.5">Demo matching</p>
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
