import { useState } from "react";
import { useQuery } from "convex/react";
import {
  BookOpen,
  Clock,
  DollarSign,
  GraduationCap,
  Hourglass,
  Mail,
  Sprout,
} from "lucide-react";
import { api } from "@/lib/convex-api";
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

type Student = {
  id: string;
  name: string;
  major: string;
  schoolYear: string;
  skills: string[];
  interests: string[];
  experience: { role: string; org: string; description: string }[];
  hoursPerWeek: number;
  workStudy: boolean;
  seekingCredit: boolean;
};

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

function StudentDetail({ student }: { student: Student }) {
  return (
    <div className="space-y-5">
      <div>
        <DialogTitle className="font-display text-2xl">
          {student.name}
        </DialogTitle>
        <DialogDescription className="mt-1">
          {student.major} · {YEAR_LABEL[student.schoolYear]} ·{" "}
          {student.hoursPerWeek} h/week available
        </DialogDescription>
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
      <p className="border-t border-primary/15 pt-4 font-mono text-[10px] leading-relaxed text-muted-foreground">
        Profiles are self-reported and shown only after the student opted in to
        faculty discovery. Reach out directly — no resume data is exposed here.
      </p>
    </div>
  );
}

function CandidateCard({
  student,
  onOpen,
  index,
}: {
  student: Student;
  onOpen: () => void;
  index: number;
}) {
  return (
    <button
      data-testid={`button-student-${student.id}`}
      onClick={onOpen}
      style={{ animationDelay: `${index * 45}ms` }}
      className="lift rise flex flex-col gap-3 border bg-card p-5 text-left"
    >
      <div>
        <p className="font-semibold">{student.name}</p>
        <p className="text-xs text-muted-foreground">
          {student.major} · {YEAR_LABEL[student.schoolYear]}
        </p>
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
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-primary">
        <Mail className="h-3.5 w-3.5" /> View full profile
      </span>
    </button>
  );
}

export function FacultyDashboard() {
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

  return (
    <div className="px-5 md:px-10 pb-12">
      {students.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {students.map((student, i) => (
            <CandidateCard
              key={student.id}
              student={student}
              index={i}
              onOpen={() => setSelectedId(student.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No students have opted in yet"
          body="Students appear here once they complete a profile and opt in to faculty discovery. Matching becomes AI-assisted once the embedding pipeline is connected."
        />
      )}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
      >
        <DialogContent className="max-w-xl max-h-[92dvh] overflow-y-auto">
          {selected && <StudentDetail student={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
