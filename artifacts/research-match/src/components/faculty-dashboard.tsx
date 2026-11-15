import { useEffect, useRef } from "react";
import { useAction, useMutation, useQuery } from "@/lib/backend";
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
import { CalendarDays } from "lucide-react";
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

export function CandidateCard({
  student,
  onOpen,
  index,
  shortlisted,
  onToggleShortlist,
  score,
  tag,
}: {
  student: Student;
  onOpen: () => void;
  index: number;
  shortlisted?: boolean;
  onToggleShortlist?: () => void;
  /** Compatibility with the selected project, 0-100. */
  score?: number;
  /** Short label such as the applicant's interest status. */
  tag?: string;
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
      {(score !== undefined || tag) && (
        <div className="flex flex-wrap items-center gap-2">
          {score !== undefined && (
            <span
              data-testid={`text-match-${student.id}`}
              title="Compatibility with this project"
              className={cn(
                "border px-1.5 py-0.5 font-mono text-[11px]",
                score >= 70
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : score >= 50
                    ? "border-chart-2/40 bg-chart-2/10 text-foreground"
                    : "border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {score}% match
            </span>
          )}
          {tag && (
            <span className="bg-accent px-2 py-0.5 text-xs text-accent-foreground">
              {tag}
            </span>
          )}
        </div>
      )}
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

export const matchesQuery = (student: Student, query: string) => {
  const t = query.trim().toLowerCase();
  if (!t) return true;
  return [student.name, student.major, ...student.minors, ...student.skills, ...student.interests]
    .join(" ")
    .toLowerCase()
    .includes(t);
};

// Seeds the public USC lab catalog the first time a faculty member opens
// Discover students on a fresh deployment (the old AI ranking panel did this).
export function useEnsureLabCatalog() {
  const catalog = useQuery(api.projects.labCatalogStatus, {});
  const seedLabs = useMutation(api.projects.seedLabs);
  const embedPending = useAction(api.projects.embedPendingProjects);
  const started = useRef(false);
  useEffect(() => {
    if (!catalog || catalog.total > 0 || started.current) return;
    started.current = true;
    void seedLabs({})
      .then(() => embedPending({}))
      .catch(() => {});
  }, [catalog, seedLabs, embedPending]);
}
