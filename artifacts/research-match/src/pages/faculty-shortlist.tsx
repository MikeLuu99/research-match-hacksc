import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@/lib/backend";
import { Lock, UserMinus, UserRound } from "lucide-react";
import { Layout, PageHeader, EmptyState } from "@/components/layout";
import { InfoTip } from "@/components/info-tip";
import { OnboardingTour } from "@/components/onboarding-tour";
import { ScoreDial } from "@/components/bits";
import { LiveStudentDialog, type LiveStudent } from "@/components/faculty-dashboard";
import { api } from "@/lib/convex-api";
import { useStore, parseShortlistKey } from "@/lib/store";
import { matchProject } from "@/lib/matching";
import { canSeeProfile, demoStudents } from "@/lib/faculty-access";
import { useFacultyMode } from "@/lib/faculty-mode";
import { useFacultyProjects } from "@/lib/faculty-projects";
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
  // The faculty member's own projects (live: their Convex listings).
  const projects = useFacultyProjects();
  const { shortlists, toggleShortlist } = useStore();
  const { toast } = useToast();
  const [pid, setPid] = useState("");
  const p = projects?.find((x) => x.id === pid) ?? projects?.[0] ?? null;
  const keys = shortlists[p?.id ?? ""] ?? [];
  // Demo and live keys never mix: each mode only renders its own source.
  const mine = keys.filter((k) => parseShortlistKey(k).source === (live ? "live" : "demo"));

  return (
    <Layout>
      <PageHeader
        tour="shortlist-header"
        eyebrow={live ? "Student shortlist · browser-local" : "Student shortlist · demo"}
        title={
          <span>
            Student Shortlist{" "}
            <InfoTip testId="tip-shortlist" label="About your shortlist">
              A per-project shortlist stored in this browser only. Shortlisting
              never notifies the student — express interest or reach out to
              start a conversation.
            </InfoTip>
          </span>
        }
      >
        A per-project list saved in this browser. Switch projects at the top; remove anyone at any time.
      </PageHeader>
      <div className="max-w-4xl space-y-4 px-5 pb-12 md:px-10">
        {projects && p && (
          <div className="border border-primary/20 bg-card p-4">
            <ProjectSelect projects={projects} value={p.id} onChange={setPid} label="Project" />
          </div>
        )}
        <LocalNotice>
          {live
            ? "Stored in this browser for this account only. Only student IDs are kept; names and details are re-read from the current consented live query. Nothing is synced and students are not notified."
            : "Fictional demo data stored in this browser. Nobody is contacted or notified."}
        </LocalNotice>
        {projects === undefined ? (
          <p role="status" className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Loading your projects…</p>
        ) : !p ? (
          <EmptyState title="No projects" body="Create a project in the lab workspace to start a shortlist." action={<Link href="/faculty" className="inline-block bg-primary px-4 py-2 text-sm text-primary-foreground">Open lab workspace</Link>} />
        ) : mine.length === 0 ? (
          <EmptyState title="Nobody shortlisted yet" body="Use the add button on Discover students to keep candidates for this project." action={<Link href="/faculty/discover" className="inline-block bg-primary px-4 py-2 text-sm text-primary-foreground">Discover students</Link>} />
        ) : live ? (
          <LiveRows keys={mine} projectId={p.id} onRemove={(k) => { toggleShortlist(p.id, k); toast({ title: "Removed from shortlist" }); }} />
        ) : (
          <DemoRows keys={mine} projectId={p.id} onRemove={(k) => { toggleShortlist(p.id, k); toast({ title: "Removed from shortlist" }); }} />
        )}
      </div>
    <OnboardingTour
      tourId="faculty-shortlist"
      steps={[{
        selector: '[data-tour="shortlist-header"]',
        title: "Student Shortlist",
        body: "Your per-project candidate list, stored in this browser only. Shortlisting never notifies the student — reach out to start a conversation.",
      }]}
    />
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

function LiveRows({ keys, projectId, onRemove }: { keys: string[]; projectId: string; onRemove: (k: string) => void }) {
  // Opted-in students and this project's applicants; anyone else stays hidden.
  const students = useQuery(api.users.shortlistProfiles, {
    projectId: projectId as never,
    studentIds: keys.map((k) => parseShortlistKey(k).id),
  });
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
                  <span className="grid h-[46px] w-[46px] shrink-0 place-items-center overflow-hidden rounded-full bg-primary font-display text-lg text-primary-foreground">
                    {s.photoUrl ? <img src={s.photoUrl} alt="" loading="lazy" className="h-full w-full object-cover" /> : s.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      {s.name}
                      <span data-testid={`text-match-${id}`} title="Compatibility with this project" className="border border-primary/30 px-1.5 py-0.5 font-mono text-[11px] font-normal text-primary">{s.compatibility}% match</span>
                      {s.applied && <span className="bg-accent px-2 py-0.5 text-xs font-normal text-accent-foreground">Applied</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.major} · {s.hoursPerWeek} h/week · {s.skills.slice(0, 4).join(", ")}</p>
                  </div>
                  <button data-testid={`button-profile-live-${id}`} onClick={() => setOpenId(s.id)} className={profBtn}><UserRound className="h-3.5 w-3.5" />Profile</button>
                </>
              ) : <Hidden title="Not currently shared" body="This student is no longer opted in to discovery and has no active interest in this project. Details are hidden." />}
              <button data-testid={`button-remove-shortlist-live-${id}`} onClick={() => onRemove(k)} aria-label="Remove from shortlist" className={iconBtn}><UserMinus className="h-4 w-4" /></button>
            </li>
          );
        })}
      </ul>
      <LiveStudentDialog student={open} onClose={() => setOpenId(null)} />
    </>
  );
}
