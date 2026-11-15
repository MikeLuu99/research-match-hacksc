import { UserPlus, UserCheck, UserRound } from "lucide-react";
import { ScoreDial } from "@/components/bits";
import type { StudentProfile } from "@/lib/data";
import type { MatchResult } from "@/lib/matching";
import { cn } from "@/lib/utils";

export function CandidateRow({ s, m, rank, shortlisted, onToggle, onOpen, tag }: {
  s: StudentProfile; m: MatchResult; rank: number; shortlisted: boolean; onToggle: () => void; onOpen: () => void; tag?: string;
}) {
  return (
    <li data-testid={`card-candidate-${s.id}`} style={{ animationDelay: `${rank * 40}ms` }} className="lift rise flex items-start gap-4 border bg-card p-4">
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-[10px] text-muted-foreground">#{String(rank + 1).padStart(2, "0")}</span>
        <ScoreDial score={m.score} size={46} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {s.name}
          {tag && <span className="ml-2 bg-accent px-2 py-0.5 align-middle font-mono text-[10px] uppercase tracking-wider text-accent-foreground">{tag}</span>}
        </p>
        <p className="text-xs text-muted-foreground">{s.major} · {s.year} · {s.hours} h/wk · fictional</p>
        <p className="mt-1.5 font-mono text-[11px]">{m.eligible ? <span className="text-chart-3">meets requirements</span> : <span className="text-muted-foreground">partial fit</span>}</p>
        <p className="mt-1 text-xs"><span className="font-mono text-[10px] uppercase text-chart-3">Transfers</span> {m.matchedSkills.concat(m.niceMatched).join(", ") || "interest overlap only"}</p>
        {m.gaps.length > 0 && <p className="text-xs"><span className="font-mono text-[10px] uppercase text-primary">Would learn</span> {m.gaps.join(", ")}</p>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <button data-testid={`button-shortlist-${s.id}`} onClick={onToggle} aria-pressed={shortlisted} aria-label={shortlisted ? `Remove ${s.name} from shortlist` : `Shortlist ${s.name}`}
          className={cn("grid h-9 w-9 place-items-center border transition-colors", shortlisted ? "border-primary bg-primary text-primary-foreground" : "border-primary/25 text-primary hover:bg-primary/5")}>
          {shortlisted ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        </button>
        <button data-testid={`button-profile-${s.id}`} onClick={onOpen} className="inline-flex items-center gap-1 border border-primary/25 px-3 py-1 text-xs text-primary hover:bg-primary/5"><UserRound className="h-3.5 w-3.5" />Profile</button>
      </div>
    </li>
  );
}
