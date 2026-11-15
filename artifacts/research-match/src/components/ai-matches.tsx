import { useCallback, useEffect, useState } from "react";
import { useAction } from "convex/react";
import {
  ArrowUpRight,
  Building2,
  LoaderCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { api } from "@/lib/convex-api";

type MatchResult = {
  sourceId: string;
  title: string;
  department: string;
  summary: string;
  faculty: string;
  sourceUrl?: string;
  similarity: number;
  open: boolean;
};

type MatchesState = {
  ready: boolean;
  matches: MatchResult[];
};

function scoreLabel(similarity: number) {
  return `${Math.round(similarity * 100)}%`;
}

function cnScore(similarity: number) {
  const pct = Math.round(similarity * 100);
  return [
    "grid h-12 w-14 shrink-0 place-items-center font-mono text-sm",
    pct >= 60
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-secondary-foreground",
  ].join(" ");
}

// AI matches for the signed-in student, computed against their stored profile
// embedding. Vector search runs action-side, so this loads on demand and can
// be refreshed after a profile edit.
export function AiMatches() {
  const myMatches = useAction(api.discovery.myMatches);
  const [state, setState] = useState<MatchesState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setState(await myMatches({}));
    } catch {
      setError("AI matching is unavailable right now. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }, [myMatches]);

  useEffect(() => {
    void run();
  }, [run]);

  if (loading && !state)
    return (
      <div
        className="flex items-center gap-2 py-8 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
        role="status"
      >
        <LoaderCircle className="animate-spin" size={14} /> Computing AI
        matches…
      </div>
    );

  if (error)
    return (
      <p className="py-8 text-sm text-muted-foreground" role="alert">
        {error}
      </p>
    );

  if (!state?.ready)
    return (
      <p className="py-8 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Your profile embedding is being generated. Matches appear in a moment.
      </p>
    );

  if (!state.matches.length)
    return (
      <p className="py-8 text-sm text-muted-foreground">
        No vector matches yet — the lab catalog is still loading. Check back
        shortly.
      </p>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-chart-2" /> Ranked by AI relevance
          (semantic + keywords)
        </span>
        <button
          onClick={() => void run()}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary hover:opacity-80"
        >
          Refresh
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {state.matches.map((match, index) => (
          <article
            key={match.sourceId}
            data-testid={`row-ai-match-${match.sourceId}`}
            style={{ animationDelay: `${index * 45}ms` }}
            className="lift rise flex gap-4 border border-primary/15 bg-card p-5"
          >
            <span className={cnScore(match.similarity)}>
              {scoreLabel(match.similarity)}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg leading-snug">
                {match.title}
              </h3>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {match.department}
                </span>
                {match.faculty && (
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="h-3 w-3" />
                    {match.faculty}
                  </span>
                )}
              </p>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {match.summary}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={
                    match.open
                      ? "bg-chart-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-accent-foreground"
                      : "border border-primary/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
                  }
                >
                  {match.open ? "recruiting" : "inquire"}
                </span>
                {match.sourceUrl && (
                  <a
                    href={match.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80"
                  >
                    Lab page <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
