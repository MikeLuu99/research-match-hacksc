import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Layout, PageHeader } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";

interface Status {
  github: { status: string; repositoryUrl: string | null };
  convex: { status: string; message: string };
  matching: { mode: string; message: string };
}

function Row({ name, status, children }: { name: string; status: string; children: ReactNode }) {
  const ok = ["connected", "live", "ok", "ready", "verified"].includes(status.toLowerCase());
  return (
    <div className="lift rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <p className="font-display text-xl flex-1">{name}</p>
        <span data-testid={`status-${name.toLowerCase()}`} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ok ? "bg-chart-3/12 text-chart-3" : "bg-muted text-muted-foreground"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-chart-3" : "bg-muted-foreground"}`} />{status}
        </span>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { reset } = useStore();
  const { toast } = useToast();
  const q = useQuery<Status>({
    queryKey: ["researchmatch-status"],
    queryFn: async () => {
      const r = await fetch(`${import.meta.env.BASE_URL}api/researchmatch/status`, { credentials: "include" });
      if (!r.ok) throw new Error(`Status endpoint returned ${r.status}`);
      return r.json();
    },
    retry: 1,
  });

  return (
    <Layout>
      <PageHeader eyebrow="Data sources & matching" title="What's real, and what's demo">
        Integration statuses come live from the server. Nothing here is faked.
      </PageHeader>
      <div className="px-5 md:px-10 pb-12 grid lg:grid-cols-2 gap-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">Integrations</h2>
            <button data-testid="button-refresh-status" onClick={() => q.refetch()} className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition"><RefreshCw className={`h-3.5 w-3.5 ${q.isFetching ? "animate-spin" : ""}`} />Refresh</button>
          </div>
          {q.isLoading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : q.isError || !q.data ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
              <p className="font-semibold text-destructive">Could not reach the status endpoint</p>
              <p className="text-sm text-muted-foreground mt-1">{(q.error as Error)?.message ?? "No data"}. Statuses are unknown; we will not guess.</p>
              <Button size="sm" variant="outline" className="mt-3" data-testid="button-retry-status" onClick={() => q.refetch()}>Retry</Button>
            </div>
          ) : (
            <>
              <Row name="GitHub" status={q.data.github.status}>
                Ground truth for code, schema and matching rules. Private student resumes are never stored there.
                {q.data.github.repositoryUrl ? (
                  <a data-testid="link-repository" href={q.data.github.repositoryUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-primary font-medium hover:underline break-all"><ExternalLink className="h-3.5 w-3.5 shrink-0" />{q.data.github.repositoryUrl}</a>
                ) : <span className="block mt-2 text-xs">No repository linked yet.</span>}
              </Row>
              <Row name="Convex" status={q.data.convex.status}>
                {q.data.convex.message}
                <span className="block mt-2 text-xs">Schema is prepared but not live. Data on this page lives in your browser's localStorage only.</span>
              </Row>
              <Row name="Matching" status={q.data.matching.mode}>{q.data.matching.message}</Row>
            </>
          )}
          <div className="rounded-2xl border bg-secondary/60 p-5 text-sm">
            <p className="font-semibold">Demo, not an official USC product</p>
            <p className="text-muted-foreground mt-1">Lab listings come from audited public USC research pages (checked Nov 2026) and are not lab-confirmed vacancies. Sample students are fictional. No authentication in the demo workspace.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">Matching method</h2>
          <div className="rounded-2xl border bg-card p-6">
            <p className="font-mono text-xs rounded bg-accent text-accent-foreground inline-block px-1.5">Demo matching · current</p>
            <p className="font-display text-xl mt-2">Local text vectors + rule checks</p>
            <ol className="mt-3 space-y-2 text-sm list-decimal pl-5 text-foreground/85">
              <li>Profile and project text are tokenized into weighted word-count vectors in your browser (skills and interests weighted 2x).</li>
              <li>Cosine similarity between the two vectors gives topical fit. These are local text vectors, not live AI embeddings.</li>
              <li>Hard checks: required-skill coverage, hours within range, credit and pay preference, eligible majors.</li>
              <li>Score = 40% text + 35% skills + 15% hours + 10% preferences. Beginner support affects ranking, not mandatory qualifications. Only open listings receive interest.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-dashed bg-card/60 p-6">
            <p className="font-mono text-xs rounded border inline-block px-1.5 text-muted-foreground">Planned · not live</p>
            <p className="font-display text-xl mt-2">Convex vector search</p>
            <p className="text-sm text-muted-foreground mt-2">Projects and opted-in profiles will be embedded and indexed in Convex. Queries will run vector search over those embeddings, then apply the same hard eligibility filters (status, majors, hours, consent) before ranking. Private profiles never enter the faculty index.</p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <p className="font-semibold">Local demo data</p>
            <p className="text-sm text-muted-foreground mt-1">Reset saves, profile edits, interest statuses and projects to the original sample.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="mt-3" data-testid="button-reset-data">Reset demo data</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Reset all local data?</AlertDialogTitle>
                <AlertDialogDescription>This clears everything stored by LABBE in this browser.</AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction data-testid="button-confirm-reset" onClick={() => { reset(); toast({ title: "Demo data reset" }); }}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
    </Layout>
  );
}
