import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search } from "lucide-react";
import { Layout, PageHeader, EmptyState } from "@/components/layout";
import { useQuery } from "@/lib/backend";
import {
  CandidateCard,
  LiveStudentDialog,
  matchesQuery,
  useEnsureLabCatalog,
} from "@/components/faculty-dashboard";
import { api } from "@/lib/convex-api";
import { useFacultyProjects } from "@/lib/faculty-projects";
import { STATUS_LABEL } from "@/lib/store";
import { useStore, shortlistKey } from "@/lib/store";
import { matchProject } from "@/lib/matching";
import { canSeeProfile, demoStudents, isApplicant } from "@/lib/faculty-access";
import { useFacultyMode } from "@/lib/faculty-mode";
import { DEMO_STUDENTS, type StudentProfile } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LocalNotice, ProjectSelect } from "@/components/faculty/demo-notice";
import { CandidateRow } from "@/components/faculty/candidate-row";
import { StudentDetailDialog } from "@/components/faculty/student-detail";

const toggleCls = (on: boolean) => cn("h-11 border px-4 text-sm transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "border-primary/25 bg-card hover:bg-primary/5");

function SearchBox({ q, setQ }: { q: string; setQ: (v: string) => void }) {
  return (
    <label className="relative flex-1">
      <span className="sr-only">Search students</span>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input data-testid="input-search-students" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, major, skill or interest" className="h-11 w-full border border-primary/25 bg-card pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
    </label>
  );
}

export default function FacultyDiscover() {
  return useFacultyMode() === "live" ? <LiveDiscover /> : <DemoDiscover />;
}

/**
 * Signed-in faculty: pick one of your projects, then see the students who
 * applied to it and recommended opted-in students ranked by compatibility.
 */
function LiveDiscover() {
  useEnsureLabCatalog();
  const projects = useFacultyProjects();
  const { shortlists, toggleShortlist } = useStore();
  const { toast } = useToast();
  const [pid, setPid] = useState("");
  const [q, setQ] = useState("");
  const [credit, setCredit] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const p = projects?.find((x) => x.id === pid) ?? projects?.[0] ?? null;
  const data = useQuery(
    api.faculty.projectStudents,
    p ? { projectId: p.id as never } : "skip",
  );
  const list = shortlists[p?.id ?? ""] ?? [];
  const keep = (s: Parameters<typeof matchesQuery>[0]) =>
    matchesQuery(s, q) && (!credit || s.seekingCredit);
  const applicants = (data?.applicants ?? []).filter(keep);
  const recommended = (data?.recommendations ?? []).filter(keep);
  const open =
    [...(data?.applicants ?? []), ...(data?.recommendations ?? [])].find(
      (s) => s.id === openId,
    ) ?? null;
  const toggle = (id: string, name: string) => {
    if (!p) return;
    const on = list.includes(shortlistKey("live", id));
    toggleShortlist(p.id, shortlistKey("live", id));
    toast({ title: on ? "Removed from shortlist" : `${name} shortlisted for ${p.title}` });
  };
  const section = (
    title: string,
    items: (typeof recommended[number] & { status?: string })[],
    empty: string,
    applied: boolean,
  ) => (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-xl">{title}</h2>
        <span className="font-mono text-xs text-muted-foreground">{items.length}</span>
      </div>
      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((s, i) => (
            <CandidateCard
              key={s.id}
              student={s}
              index={i}
              score={s.compatibility}
              tag={applied && s.status ? STATUS_LABEL[s.status as keyof typeof STATUS_LABEL] : undefined}
              onOpen={() => setOpenId(s.id)}
              shortlisted={list.includes(shortlistKey("live", s.id))}
              onToggleShortlist={() => toggle(s.id, s.name)}
            />
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-primary/30 px-4 py-6 text-center text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  );
  return (
    <Layout>
      <PageHeader eyebrow="Discover students · live" title="Interested Students">
        Students who applied to your projects, plus recommended students who opted in to faculty discovery.
      </PageHeader>
      <div className="space-y-6 px-5 pb-12 md:px-10">
        {projects === undefined ? (
          <p role="status" className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Loading your projects…</p>
        ) : !p ? (
          <EmptyState title="Create a project first" body="Applicants and recommended students are shown for one of your project listings." action={<Link href="/faculty" className="inline-block bg-primary px-4 py-2 text-sm text-primary-foreground">Open lab workspace</Link>} />
        ) : (
          <>
            <div className="max-w-3xl border border-primary/20 bg-card p-4">
              <ProjectSelect projects={projects} value={p.id} onChange={setPid} label="Project" />
            </div>
            <div className="flex max-w-3xl flex-col gap-3 sm:flex-row">
              <SearchBox q={q} setQ={setQ} />
              <button data-testid="filter-credit" aria-pressed={credit} onClick={() => setCredit(!credit)} className={toggleCls(credit)}>Seeking credit</button>
            </div>
            {data === undefined ? (
              <p role="status" className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Loading students…</p>
            ) : (
              <>
                {section("Applicants", applicants, q || credit ? "No applicants match your filters." : "No one has sent interest in this project yet.", true)}
                {section("Recommended students", recommended, q || credit ? "No recommended students match your filters." : "No opted-in students to recommend yet. Students appear here once they complete a profile and opt in to faculty discovery.", false)}
              </>
            )}
            <LocalNotice>Applicants are students who sent interest in this project. Recommendations are opted-in students ranked by compatibility with it. Shortlists keep student IDs in this browser only; students are not notified. Email and résumé are not available from the current faculty API.</LocalNotice>
          </>
        )}
      </div>
      <LiveStudentDialog student={open} onClose={() => setOpenId(null)} />
    </Layout>
  );
}

function DemoDiscover() {
  const { projects, profile, interests, shortlists, toggleShortlist } = useStore();
  const [pid, setPid] = useState(projects[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [meets, setMeets] = useState(false);
  const [open, setOpen] = useState<StudentProfile | null>(null);
  const p = projects.find((x) => x.id === pid) ?? projects[0] ?? null;
  const list = shortlists[p?.id ?? ""] ?? [];

  const rows = useMemo(() => {
    if (!p) return [];
    const t = q.trim().toLowerCase();
    return demoStudents(DEMO_STUDENTS, profile)
      .filter((s) => canSeeProfile(s, interests, p.id))
      .map((s) => ({ s, m: matchProject(s, p), applied: isApplicant(s.id, interests, p.id) }))
      .filter(({ m }) => !meets || m.eligible)
      .filter(({ s }) => !t || [s.name, s.major, ...s.skills, ...s.interests].join(" ").toLowerCase().includes(t))
      .sort((a, b) => b.m.score - a.m.score);
  }, [p, profile, interests, q, meets]);
  const applicants = rows.filter((r) => r.applied);
  const others = rows.filter((r) => !r.applied);

  if (!p) return <Layout><PageHeader eyebrow="Discover students" title="No Project To Rank Against" /><div className="px-5 md:px-10"><EmptyState title="Create a project first" body="Students are ranked against one of your listings." action={<Link href="/faculty" className="inline-block bg-primary px-4 py-2 text-sm text-primary-foreground">Open lab workspace</Link>} /></div></Layout>;

  const section = (title: string, items: typeof rows, empty: string, offset: number, tag?: string) => (
    <section>
      <div className="mb-3 flex items-baseline justify-between"><h2 className="font-display text-xl">{title}</h2><span className="font-mono text-xs text-muted-foreground">{items.length}</span></div>
      {items.length ? (
        <ul className="space-y-2">{items.map(({ s, m }, i) => { const k = shortlistKey("demo", s.id); return <CandidateRow key={s.id} s={s} m={m} rank={offset + i} tag={tag} shortlisted={list.includes(k)} onToggle={() => toggleShortlist(p.id, k)} onOpen={() => setOpen(s)} />; })}</ul>
      ) : <p className="border border-dashed border-primary/30 px-4 py-6 text-center text-sm text-muted-foreground">{empty}</p>}
    </section>
  );

  return (
    <Layout>
      <PageHeader eyebrow={`Discover students · demo · ${p.department}`} title="Interested Students">
        Opted-in fictional students and direct applicants from any department, ranked by demo matching. Cross-department fits are the point.
      </PageHeader>
      <div className="max-w-4xl space-y-5 px-5 pb-12 md:px-10">
        <div className="grid items-end gap-4 border border-primary/20 bg-card p-4 sm:grid-cols-[1fr_auto]">
          <ProjectSelect projects={projects} value={p.id} onChange={setPid} />
          <div className="flex gap-5 text-center">
            <div><p className="font-display text-2xl" data-testid="text-count-pool">{rows.length}</p><p className="font-mono text-[10px] uppercase text-muted-foreground">shown</p></div>
            <div><p className="font-display text-2xl text-chart-3">{rows.filter((r) => r.m.eligible).length}</p><p className="font-mono text-[10px] uppercase text-muted-foreground">meet reqs</p></div>
            <div><p className="font-display text-2xl text-primary">{list.length}</p><p className="font-mono text-[10px] uppercase text-muted-foreground">shortlisted</p></div>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchBox q={q} setQ={setQ} />
          <button data-testid="filter-meets" aria-pressed={meets} onClick={() => setMeets(!meets)} className={toggleCls(meets)}>Meets requirements only</button>
        </div>
        <LocalNotice>Fictional demo data, local to this browser. Only opted-in students and students who sent this project interest appear; private profiles are not shown or counted.</LocalNotice>
        {section("Applicants", applicants, "No one has sent interest in this project yet.", 0, "applied")}
        {section("Potential candidates", others, meets ? "No other students meet every requirement. Turn off the filter to see partial matches." : "No other opted-in students match your search.", applicants.length)}
      </div>
      <StudentDetailDialog s={open} project={p} onClose={() => setOpen(null)} />
    </Layout>
  );
}
