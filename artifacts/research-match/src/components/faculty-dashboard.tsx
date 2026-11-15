import { useCallback, useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  Clock,
  DollarSign,
  GraduationCap,
  FileText,
  Hourglass,
  Mail,
  Sprout,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { api } from "@/lib/convex-api";
import { ScheduleGrid } from "@/components/schedule-grid";
import { Sparkles, CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const YEAR_LABEL: Record<string, string> = {
  freshman: "Freshman",
  sophomore: "Sophomore",
  junior: "Junior",
  senior: "Senior",
  masters: "Master’s student",
  phd: "PhD student",
};

export type LiveStudent = Student;

type Student = {
  id: string;
  name: string;
  photoUrl?: string;
  major: string;
  schedule?: string;
  minors: string[];
  schoolYear: string;
  skills: string[];
  interests: string[];
  experience: { role: string; org: string; description: string }[];
  hoursPerWeek: number;
  workStudy: boolean;
  seekingCredit: boolean;
};

// Student's optional profile photo, or their initials when none is set.
function StudentAvatar({ student, size }: { student: Student; size: number }) {
  const initials = student.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-full border border-primary/20 bg-primary/8 font-mono text-xs text-primary"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {student.photoUrl ? (
        <img
          src={student.photoUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
}

function SkillChips({ items }: { items: string[] }) {
  if (!items.length)
    return <p className="text-xs text-muted-foreground">None listed yet.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="border border-primary/25 bg-primary/8 px-2 py-0.5 text-xs text-primary"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// The faculty API intentionally exposes no contact or resume fields. These
// sections say so explicitly instead of fabricating or reaching for them.
function PrivateFields() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        { icon: Mail, label: "Email", id: "email" },
        { icon: FileText, label: "Résumé", id: "resume" },
      ].map(({ icon: Icon, label, id }) => (
        <div key={id} className="border border-primary/15 p-3">
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
            <Icon className="h-3.5 w-3.5" /> {label}
          </p>
          <p
            data-testid={`text-live-${id}`}
            className="mt-1 text-xs text-muted-foreground"
          >
            Not shared. Not available from the current faculty API.
          </p>
        </div>
      ))}
    </div>
  );
}

function StudentDetail({ student }: { student: Student }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <StudentAvatar student={student} size={64} />
        <div className="min-w-0">
          <DialogTitle className="font-display text-2xl">
            {student.name}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {student.major}
            {student.minors.length ? ` · Minors: ${student.minors.join(", ")}` : ""}{" "}
            · {YEAR_LABEL[student.schoolYear]} · {student.hoursPerWeek} h/week
            available
          </DialogDescription>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {student.workStudy && (
          <span className="inline-flex items-center gap-1.5 border border-primary/25 bg-accent px-2 py-1 text-xs text-accent-foreground">
            <DollarSign className="h-3.5 w-3.5" /> Work-Study eligible
          </span>
        )}
        {student.seekingCredit && (
          <span className="inline-flex items-center gap-1.5 border border-primary/25 bg-accent px-2 py-1 text-xs text-accent-foreground">
            <GraduationCap className="h-3.5 w-3.5" /> Seeking credit
          </span>
        )}
      </div>
      <section>
        <h4 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
          <Hourglass className="h-3.5 w-3.5" /> Skills
        </h4>
        <div className="mt-2">
          <SkillChips items={student.skills} />
        </div>
      </section>
      <section>
        <h4 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
          <Sprout className="h-3.5 w-3.5" /> Research interests
        </h4>
        <div className="mt-2">
          <SkillChips items={student.interests} />
        </div>
      </section>
      {student.schedule && (
        <section>
          <h4 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
            <CalendarDays className="h-3.5 w-3.5" /> Weekly availability (
            {(student.schedule.split(",").filter(Boolean)).length} h/week)
          </h4>
          <div className="mt-2">
            <ScheduleGrid value={student.schedule} readOnly />
          </div>
        </section>
      )}
      <section>
        <h4 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
          <BookOpen className="h-3.5 w-3.5" /> Experience
        </h4>
        {student.experience.length ? (
          <ul className="mt-2 space-y-3">
            {student.experience.map((entry, i) => (
              <li key={i} className="border-l-2 border-primary/20 pl-3">
                <p className="text-sm font-semibold">
                  {entry.role}
                  {entry.org ? ` · ${entry.org}` : ""}
                </p>
                {entry.description && (
                  <p className="text-xs text-muted-foreground">
                    {entry.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            No experience entries yet. A resume may be attached to their
            profile.
          </p>
        )}
      </section>
      <PrivateFields />
      <p className="border-t border-primary/15 pt-4 font-mono text-[10px] leading-relaxed text-muted-foreground">
        Profiles are self-reported and shown only after the student opted in to
        faculty discovery. No contact or resume data is exposed here.
      </p>
    </div>
  );
}

function CandidateCard({
  student,
  onOpen,
  index,
  shortlisted,
  onToggleShortlist,
}: {
  student: Student;
  onOpen: () => void;
  index: number;
  shortlisted?: boolean;
  onToggleShortlist?: () => void;
}) {
  return (
    <div
      data-testid={`card-live-student-${student.id}`}
      style={{ animationDelay: `${index * 45}ms` }}
      className="lift rise relative flex flex-col gap-3 border bg-card p-5 text-left"
    >
      {onToggleShortlist && (
        <button
          data-testid={`button-shortlist-live-${student.id}`}
          onClick={onToggleShortlist}
          aria-pressed={!!shortlisted}
          aria-label={
            shortlisted
              ? `Remove ${student.name} from shortlist`
              : `Shortlist ${student.name}`
          }
          className={cn(
            "absolute right-3 top-3 grid h-9 w-9 place-items-center border transition-colors",
            shortlisted
              ? "border-primary bg-primary text-primary-foreground"
              : "border-primary/25 text-primary hover:bg-primary/5",
          )}
        >
          {shortlisted ? (
            <UserCheck className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </button>
      )}
      <div className="flex items-center gap-3 pr-10">
        <StudentAvatar student={student} size={40} />
        <div className="min-w-0">
          <p className="font-semibold">{student.name}</p>
          <p className="text-xs text-muted-foreground">
            {student.major} · {YEAR_LABEL[student.schoolYear]}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {student.hoursPerWeek} h/week
        </span>
        {student.workStudy && (
          <span className="inline-flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5" /> Work-Study
          </span>
        )}
        {student.seekingCredit && (
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" /> Credit
          </span>
        )}
      </div>
      <SkillChips items={student.skills.slice(0, 6)} />
      {student.interests.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Interested in: {student.interests.slice(0, 3).join(", ")}
          {student.interests.length > 3 ? "…" : ""}
        </p>
      )}
      <button
        data-testid={`button-student-${student.id}`}
        onClick={onOpen}
        className="mt-auto inline-flex items-center gap-1 self-start text-xs font-semibold text-primary hover:underline"
      >
        View full profile
      </button>
    </div>
  );
}

export function LiveStudentDialog({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={student !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[92dvh] overflow-y-auto">
        {student && <StudentDetail student={student} />}
      </DialogContent>
    </Dialog>
  );
}

const matchesQuery = (student: Student, query: string) => {
  const t = query.trim().toLowerCase();
  if (!t) return true;
  return [student.name, student.major, ...student.minors, ...student.skills, ...student.interests]
    .join(" ")
    .toLowerCase()
    .includes(t);
};

export function FacultyDashboard({
  query = "",
  creditOnly = false,
  isShortlisted,
  onToggleShortlist,
}: {
  query?: string;
  creditOnly?: boolean;
  /** Optional browser-local shortlist hooks; only student IDs are passed out. */
  isShortlisted?: (studentId: string) => boolean;
  onToggleShortlist?: (studentId: string, name: string) => void;
} = {}) {
  const students = useQuery(api.users.listStudents, {});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (students === undefined)
    return (
      <div className="px-5 md:px-10 py-8" role="status">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Loading candidates…
        </p>
      </div>
    );

  const selected =
    students.find((student) => student.id === selectedId) ?? null;
  const visible = students.filter(
    (student) =>
      matchesQuery(student, query) && (!creditOnly || student.seekingCredit),
  );

  return (
    <div className="px-5 md:px-10 pb-12 space-y-6">
      {students.length && !visible.length ? (
        <EmptyState
          title="No consented students match"
          body="Clear the search or filters to see every opted-in student."
        />
      ) : students.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((student, i) => (
            <CandidateCard
              key={student.id}
              student={student}
              index={i}
              onOpen={() => setSelectedId(student.id)}
              shortlisted={isShortlisted?.(student.id)}
              onToggleShortlist={
                onToggleShortlist
                  ? () => onToggleShortlist(student.id, student.name)
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No students have opted in yet"
          body="Students appear here once they complete a profile and opt in to faculty discovery. Matching becomes AI-assisted once the embedding pipeline is connected."
        />
      )}
      <AiRankingPanel />
      <LiveStudentDialog
        student={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

type LabOption = {
  id: string;
  sourceId: string;
  title: string;
  department: string;
  recruitmentStatus: string;
  hasEmbedding: boolean;
};

type CandidateMatch = {
  studentId: string;
  name: string;
  major: string;
  schoolYear: string;
  skills: string[];
  interests: string[];
  hoursPerWeek: number;
  similarity: number;
};

// Faculty AI ranking: pick a lab, get consented students ranked by embedding
// similarity. Seeds the lab catalog on first load (faculty action).
function AiRankingPanel() {
  const catalog = useQuery(api.projects.labCatalogStatus, {});
  const labs = useQuery(api.projects.listLabs, {});
  const seedLabs = useMutation(api.projects.seedLabs);
  const embedPending = useAction(api.projects.embedPendingProjects);
  const labCandidates = useAction(api.discovery.labCandidates);
  const [labId, setLabId] = useState<string | null>(null);
  const [ranking, setRanking] = useState<{
    ready: boolean;
    matches: CandidateMatch[];
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const seed = useCallback(async () => {
    setBusy(true);
    setNotice("");
    try {
      const result = await seedLabs({});
      await embedPending({});
      setNotice(
        `Catalog loaded: ${result.inserted} labs added, ${result.updated} updated.`,
      );
    } catch {
      setNotice("Couldn't load the lab catalog. Try again shortly.");
    } finally {
      setBusy(false);
    }
  }, [seedLabs, embedPending]);

  useEffect(() => {
    if (catalog && catalog.total === 0 && !busy) void seed();
  }, [catalog, busy, seed]);

  useEffect(() => {
    if (labs && labs.length && !labId) {
      const firstEmbedded = labs.find((lab) => lab.hasEmbedding);
      if (firstEmbedded) setLabId(firstEmbedded.id);
    }
  }, [labs, labId]);

  useEffect(() => {
    if (!labId) return;
    setRanking(null);
    labCandidates({ labId: labId as never })
      .then((result) => setRanking(result as { ready: boolean; matches: CandidateMatch[] }))
      .catch(() => setNotice("AI ranking is unavailable right now."));
  }, [labId, labCandidates]);

  if (catalog === undefined || labs === undefined) return null;

  return (
    <section className="border border-primary/20 bg-card p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-xl flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-chart-2" /> AI candidate ranking
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {catalog.total
            ? `${catalog.embedded}/${catalog.total} labs embedded`
            : "catalog empty"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <select
            aria-label="Choose a lab to rank candidates"
            value={labId ?? ""}
            onChange={(event) => setLabId(event.target.value)}
            className="h-10 border border-primary/25 bg-background px-3 text-sm max-w-[380px]"
          >
            <option value="">Choose a lab…</option>
            {labs.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.title} · {lab.department}
              </option>
            ))}
          </select>
          <button
            onClick={() => void seed()}
            disabled={busy}
            className="border border-primary/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-primary hover:bg-primary/5 disabled:opacity-50"
          >
            {busy ? "Working…" : "Reload catalog"}
          </button>
        </div>
      </div>
      {notice && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground" role="status">
          {notice}
        </p>
      )}
      {labId && !ranking && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground" role="status">
          Ranking candidates…
        </p>
      )}
      {ranking && !ranking.ready && (
        <p className="mt-3 text-xs text-muted-foreground">
          This lab's embedding is still being generated. Reload the catalog and
          try again in a moment.
        </p>
      )}
      {ranking?.ready && ranking.matches.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          No opted-in students have profile embeddings yet — matches appear as
          students complete profiles.
        </p>
      )}
      {ranking?.ready && ranking.matches.length > 0 && (
        <ol className="mt-4 space-y-1.5">
          {ranking.matches.map((match) => (
            <li
              key={match.studentId}
              data-testid={`row-ai-candidate-${match.studentId}`}
              className="flex items-center gap-3 border border-primary/15 bg-background px-3 py-2"
            >
              <span className="grid h-9 w-11 shrink-0 place-items-center bg-primary font-mono text-[11px] text-primary-foreground">
                {Math.round(match.similarity * 100)}%
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{match.name}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {match.major} · {match.hoursPerWeek} h/week
                </span>
              </span>
              <span className="hidden md:block text-[11px] text-muted-foreground max-w-[40%] truncate">
                {match.interests.slice(0, 3).join(", ")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
