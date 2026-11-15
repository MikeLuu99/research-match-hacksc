import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "convex/react";
import { Lock, UserMinus, UserRound } from "lucide-react";
import { Layout, PageHeader, EmptyState } from "@/components/layout";
import { ScoreDial } from "@/components/bits";
import { LiveStudentDialog, type LiveStudent } from "@/components/faculty-dashboard";
import { api } from "@/lib/convex-api";
import { useStore, parseShortlistKey } from "@/lib/store";
import { matchProject } from "@/lib/matching";
import { canSeeProfile, demoStudents } from "@/lib/faculty-access";
import { useFacultyMode } from "@/lib/faculty-mode";
import { DEMO_STUDENTS, type StudentProfile } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { LocalNotice, ProjectSelect } from "@/components/faculty/demo-notice";
import { StudentDetailDialog } from "@/components/faculty/student-detail";

const iconBtn = "grid h-9 w-9 place-items-center border border-primary/25 hover:border-destructive/40 hover:text-destructive";
const profBtn = "inline-flex items-center gap-1 border border-primary/25 px-3 py-1.5 text-xs text-primary hover:bg-primary/5";

function Hidden({ title, body }: { title: string; body: string }) {
  return (
    <>
      <span className="grid h-[46px] w-[46px] shrink-0 place-items-center bg-secondary"><Lock className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1"><p className="font-semibold">{title}</p><p className="text-xs text-muted-foreground">{body}</p></div>
    </>
  );
}

export default function FacultyShortlist() {
  const live = useFacultyMode() === "live";
  const { projects, shortlists, toggleShortlist } = useStore();
  const { toast } = useToast();
  const [pid, setPid] = useState(projects[0]?.id ?? "");
  const p = projects.find((x) => x.id === pid) ?? projects[0] ?? null;
  const keys = shortlists[p?.id ?? ""] ?? [];
  // Demo and live keys never mix: each mode only renders its own source.
  const mine = keys.filter((k) => parseShortlistKey(k).source === (live ? "live" : "demo"));

  return (
    <Layout>
      <PageHeader eyebrow={live ? "Student shortlist · browser-local" : "Student shortlist · demo"} title="Keep the ones worth a conversation.">
        A per-project list saved in this browser. Switch projects at the top; remove anyone at any time.
      </PageHeader>
      <div className="max-w-4xl space-y-4 px-5 pb-12 md:px-10">
        {p && (
          <div className="border border-primary/20 bg-card p-4">
            <ProjectSelect projects={projects} value={p.id} onChange={setPid} label="Shortlist for project" />
          </div>
        )}
        <LocalNotice>
          {live
            ? "Stored in this browser for this account only. Only student IDs are kept; names and details are re-read from the current consented live query. Nothing is synced and students are not notified."
            : "Fictional demo data stored in this browser. Nobody is contacted or notified."}
        </LocalNotice>
        {!p ? (
          <EmptyState title="No projects" body="Create a project in the lab workspace to start a shortlist." />
        ) : mine.length === 0 ? (
          <EmptyState title="Nobody shortlisted yet" body="Use the add button on Discover students to keep candidates for this project." action={<Link href="/faculty/discover" className="inline-block bg-primary px-4 py-2 text-sm text-primary-foreground">Discover students</Link>} />
        ) : live ? (
          <LiveRows keys={mine} onRemove={(k) => { toggleShortlist(p.id, k); toast({ title: "Removed from shortlist" }); }} />
        ) : (
          <DemoRows keys={mine} projectId={p.id} onRemove={(k) => { toggleShortlist(p.id, k); toast({ title: "Removed from shortlist" }); }} />
        )}
      </div>
    </Layout>
  );
}

function DemoRows({ keys, projectId, onRemove }: { keys: string[]; projectId: string; onRemove: (k: string) => void }) {
  const { projects, profile, interests } = useStore();
  const [open, setOpen] = useState<StudentProfile | null>(null);
  const p = projects.find((x) => x.id === projectId) ?? null;
  const students = demoStudents(DEMO_STUDENTS, profile);
  return (
    <>
      <ul className="space-y-2">
        {keys.map((k, i) => {
          const id = parseShortlistKey(k).id;
          const s = students.find((x) => x.id === id);
          const visible = s && p && canSeeProfile(s, interests, p.id);
          return (
            <li key={k} data-testid={`row-shortlist-${id}`} style={{ animationDelay: `${i * 40}ms` }} className="rise flex items-center gap-4 border bg-card p-4">
              {s && visible && p ? (
                <>
                  <ScoreDial score={matchProject(s, p).score} size={46} />
                  <div className="min-w-0 flex-1"><p className="font-semibold">{s.name} <span className="text-xs font-normal text-muted-foreground">fictional</span></p><p className="text-xs text-muted-foreground">{s.major} · {s.year} · {s.skills.slice(0, 4).join(", ")}</p></div>
                  <button data-testid={`button-profile-${id}`} onClick={() => setOpen(s)} className={profBtn}><UserRound className="h-3.5 w-3.5" />Profile</button>
                </>
              ) : <Hidden title="Profile no longer shared" body="This student made their profile private. Details are hidden." />}
              <button data-testid={`button-remove-shortlist-${id}`} onClick={() => onRemove(k)} aria-label="Remove from shortlist" className={iconBtn}><UserMinus className="h-4 w-4" /></button>
            </li>
          );
        })}
      </ul>
      <StudentDetailDialog s={open} project={p} onClose={() => setOpen(null)} />
    </>
  );
}

function LiveRows({ keys, onRemove }: { keys: string[]; onRemove: (k: string) => void }) {
  const students = useQuery(api.users.listStudents, {});
  const [openId, setOpenId] = useState<string | null>(null);
  if (students === undefined)
    return <ul className="space-y-2" role="status" aria-label="Loading shortlist">{keys.map((k) => <li key={k} className="h-[78px] animate-pulse border bg-card" />)}</ul>;
  const open: LiveStudent | null = students.find((s) => s.id === openId) ?? null;
  return (
    <>
      <ul className="space-y-2">
        {keys.map((k, i) => {
          const id = parseShortlistKey(k).id;
          const s = students.find((x) => x.id === id);
          return (
            <li key={k} data-testid={`row-shortlist-live-${id}`} style={{ animationDelay: `${i * 40}ms` }} className="rise flex items-center gap-4 border bg-card p-4">
              {s ? (
                <>
                  <span className="grid h-[46px] w-[46px] shrink-0 place-items-center bg-primary font-display text-lg text-primary-foreground">{s.name.slice(0, 1)}</span>
                  <div className="min-w-0 flex-1"><p className="font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.major} · {s.hoursPerWeek} h/week · {s.skills.slice(0, 4).join(", ")}</p></div>
                  <button data-testid={`button-profile-live-${id}`} onClick={() => setOpenId(s.id)} className={profBtn}><UserRound className="h-3.5 w-3.5" />Profile</button>
                </>
              ) : <Hidden title="Not currently shared" body="This student is not in the current consented list (opted out or removed). Details are hidden." />}
              <button data-testid={`button-remove-shortlist-live-${id}`} onClick={() => onRemove(k)} aria-label="Remove from shortlist" className={iconBtn}><UserMinus className="h-4 w-4" /></button>
            </li>
          );
        })}
      </ul>
      <LiveStudentDialog student={open} onClose={() => setOpenId(null)} />
    </>
  );
}
