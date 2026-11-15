import { useCallback, useEffect, useRef, useState } from "react";
import { useAction, useMutation } from "@/lib/backend";
import {
  ArrowUpRight,
  Building2,
  LoaderCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { MascotLoading } from "@/components/mascot";
import { api } from "@/lib/convex-api";
import { InterestButton, SaveButton } from "@/components/bits";
import { useAccount } from "@/lib/auth";

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
  demo?: boolean;
  studentName?: string;
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
  const account = useAccount();
  if (!account.isConfigured)
    return (
      <p className="py-8 text-sm text-muted-foreground">
        Explore the catalog below. AI recommendations become available when the
        backend is connected.
      </p>
    );
  return <ConnectedAiMatches />;
}

function useAiMatchResults() {
  const account = useAccount();
  const realUser =
    account.isAuthenticated &&
    account.viewer?.accountType === "student" &&
    account.viewer.hasStudentProfile;
  const myMatches = useAction(api.discovery.myMatches);
  const demoMatches = useAction(api.discovery.demoMatches);
  const seedLabs = useMutation(api.projects.seedLabs);
  const embedPending = useAction(api.projects.embedPendingProjects);
  const [state, setState] = useState<MatchesState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const attemptedSeed = useRef(false);

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = (
        realUser ? await myMatches({}) : await demoMatches({})
      ) as MatchesState;
      // Empty catalog: seed + embed once, then re-rank. The USC-email gate
      // on seeding keeps this off for unauthenticated visitors.
      if (
        realUser &&
        result.ready &&
        result.matches.length === 0 &&
        !attemptedSeed.current
      ) {
        attemptedSeed.current = true;
        setSeeding(true);
        try {
          await seedLabs({});
          await embedPending({});
          setState((await myMatches({})) as MatchesState);
          setSeeding(false);
          setLoading(false);
          return;
        } catch {
          setSeeding(false);
        }
      }
      setState(result);
    } catch {
      setError("AI matching is unavailable right now. Try again shortly.");
    } finally {
      setSeeding(false);
      setLoading(false);
    }
  }, [realUser, myMatches, demoMatches, seedLabs, embedPending]);

  useEffect(() => {
    void run();
  }, [run]);

  return { state, error, loading, seeding, run };
}

function ConnectedAiMatches() {
  const { state, error, loading, seeding, run } = useAiMatchResults();

  if ((loading && !state) || seeding)
    return (
      <div role="status">
        <MascotLoading
          label={
            seeding
              ? "Loading the lab catalog (first visit embeds 82 labs)…"
              : "Scanning labs across USC…"
          }
        />
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
        <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-chart-2" /> Ranked by AI relevance
          (semantic + keywords)
          {state.demo && (
            <span className="ml-2 bg-chart-2 px-2 py-0.5 text-accent-foreground">
              demo student · {state.studentName ?? "Jane Doe"}
            </span>
          )}
        </span>
        <button
          onClick={() => void run()}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary hover:opacity-80"
        >
          Refresh
        </button>
      </div>
      <div className="grid gap-3">
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
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg leading-snug">
                  {match.title}
                </h3>
                <SaveButton id={match.sourceId} />
              </div>
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
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {match.summary}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <InterestButton projectId={match.sourceId} open={match.open} />
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
