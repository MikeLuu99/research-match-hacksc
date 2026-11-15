import { Mail, FileText, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScoreDial } from "@/components/bits";
import { useStore } from "@/lib/store";
import { matchProject } from "@/lib/matching";
import { sharedDetails } from "@/lib/faculty-access";
import type { Project, StudentProfile } from "@/lib/data";

const label = "flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary";

/** Demo-only detail view for fictional / sample students. */
export function StudentDetailBody({ s, project }: { s: StudentProfile; project: Project | null }) {
  const { interests, profile } = useStore();
  const d = sharedDetails(s, interests, project?.id);
  if (!d.visible) {
    return (
      <div data-testid="text-profile-unavailable" className="flex gap-2 bg-secondary p-4 text-sm">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" />This student is no longer sharing a profile with faculty. Details are not shown.
      </div>
    );
  }
  const m = project ? matchProject(s, project) : null;
  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl leading-tight" data-testid="text-detail-name">{s.name}</p>
          <p className="text-xs text-muted-foreground">{s.major} · {s.year} · {s.hours} h/wk · {s.id === profile.id ? "sample student" : "fictional demo student"}</p>
        </div>
        {m && <ScoreDial score={m.score} size={50} />}
      </div>
      {s.bio && <p className="text-foreground/80">{s.bio}</p>}
      <div>
        <p className={label}>Skills</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">{s.skills.length ? s.skills.map((k) => <span key={k} className="border border-primary/25 bg-primary/8 px-2 py-0.5 text-xs text-primary">{k}</span>) : <span className="text-xs text-muted-foreground">None listed.</span>}</div>
      </div>
      {s.interests.length > 0 && <p className="text-xs"><span className="font-semibold">Interests:</span> {s.interests.join(", ")}</p>}
      {m && project && (
        <div className="space-y-1.5 border border-primary/15 bg-background p-3">
          <p className={label}>Against "{project.title}"</p>
          {m.strengths.map((x) => <p key={x} className="text-xs text-chart-3">{x.replace(/^You already list/, "Lists").replace(/^Your /, "Their ")}</p>)}
          <p className="text-xs"><span className="font-semibold">Would learn:</span> {m.gaps.join(", ") || "none on required skills"}</p>
          {m.notes.map((x) => <p key={x} className="text-xs text-muted-foreground">{x}</p>)}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-primary/15 p-3">
          <p className={label}><Mail className="h-3.5 w-3.5" />Email</p>
          <p data-testid="text-detail-email" className={d.email ? "mt-1 break-all font-mono text-xs" : "mt-1 text-xs text-muted-foreground"}>{d.email ?? "Not shared"}</p>
        </div>
        <div className="border border-primary/15 p-3 sm:col-span-2">
          <p className={label}><FileText className="h-3.5 w-3.5" />Résumé</p>
          <p data-testid="text-detail-resume" className={d.resume ? "mt-1 max-h-48 overflow-y-auto whitespace-pre-line font-mono text-xs" : "mt-1 text-xs text-muted-foreground"}>{d.resume ?? "Not shared"}</p>
        </div>
      </div>
      <p className="font-mono text-[10px] text-muted-foreground">Email and résumé appear only when the student turns on each sharing switch. Demo only; nothing is emailed.</p>
    </div>
  );
}

export function StudentDetailDialog({ s, project, onClose }: { s: StudentProfile | null; project: Project | null; onClose: () => void }) {
  return (
    <Dialog open={!!s} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto">
        <DialogTitle className="sr-only">Student details</DialogTitle>
        <DialogDescription className="sr-only">Shared profile fields for this fictional student.</DialogDescription>
        {s && <StudentDetailBody s={s} project={project} />}
      </DialogContent>
    </Dialog>
  );
}
