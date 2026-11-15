import { useCallback, useEffect, useState } from "react";
import { useAction } from "convex/react";
import { ArrowUpRight, LoaderCircle, Sparkles } from "lucide-react";
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
        className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
        role="status"
      >
        <LoaderCircle className="animate-spin" size={14} /> Computing AI
        matches…
      </div>
    );

  if (error)
    return (
      <p className="text-xs text-muted-foreground" role="alert">
        {error}
      </p>
    );

  if (!state?.ready)
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Your profile embedding is being generated. Matches appear in a moment.
      </p>
    );

  if (!state.matches.length)
    return (
      <p className="text-xs text-muted-foreground">
        No vector matches yet — the lab catalog is still loading. Check back
        shortly.
      </p>
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-chart-2" /> Embedding similarity
        </span>
        <button
          onClick={() => void run()}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary hover:opacity-80"
        >
          Refresh
        </button>
      </div>
      <ol className="space-y-1.5">
        {state.matches.map((match) => (
          <li
            key={match.sourceId}
            data-testid={`row-ai-match-${match.sourceId}`}
            className="flex items-center gap-3 border border-primary/15 bg-card px-3 py-2"
          >
            <span
              className={cnScore(match.similarity)}
              aria-label={`similarity ${scoreLabel(match.similarity)}`}
            >
              {scoreLabel(match.similarity)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold leading-snug">
                {match.title}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {match.department}
              </span>
            </span>
            {!match.open && (
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                inquire
              </span>
            )}
            {match.sourceUrl && (
              <a
                href={match.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary"
                aria-label={`Open lab page for ${match.title}`}
              >
                <ArrowUpRight size={14} />
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function cnScore(similarity: number) {
  const pct = Math.round(similarity * 100);
  return [
    "grid h-9 w-11 shrink-0 place-items-center font-mono text-[11px]",
    pct >= 60
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-secondary-foreground",
  ].join(" ");
}
