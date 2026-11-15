import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@/lib/backend";
import { format } from "date-fns";
import { Trash2, LoaderCircle } from "lucide-react";
import { Layout, PageHeader, EmptyState } from "@/components/layout";
import { RecruitPill } from "@/components/bits";
import { ProjectDialog } from "@/components/project-dialog";
import { STATUS_LABEL, useStore, type InterestStatus } from "@/lib/store";
import type { Project } from "@/lib/data";
import { api } from "@/lib/convex-api";
import { useAccount } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STAGES: InterestStatus[] = ["interested", "contacted", "conversation", "accepted", "declined", "withdrawn"];
const tone: Record<InterestStatus, string> = {
  interested: "bg-accent text-accent-foreground",
  contacted: "bg-secondary text-secondary-foreground",
  conversation: "bg-chart-4/15 text-chart-4",
  accepted: "bg-chart-3/15 text-chart-3",
  declined: "bg-destructive/10 text-destructive",
  withdrawn: "bg-muted text-muted-foreground",
};

export default function Applications() {
  const account = useAccount();
  const live =
    account.isAuthenticated &&
    account.viewer?.accountType === "student" &&
    account.viewer.hasStudentProfile;
  const liveInterests = useQuery(api.interests.myInterests, live ? {} : "skip");
  const withdraw = useMutation(api.interests.withdrawInterest);
  const { toast } = useToast();
  const { interests, projects, profile, setInterestStatus, removeInterest } = useStore();
  const [open, setOpen] = useState<Project | null>(null);
  const mine = interests.filter((i) => i.studentId === profile.id);
  return (
    <Layout>
      <PageHeader eyebrow="Interest tracker" title="Where things stand">Track each conversation. Faculty see the same request in their workspace and can update it.</PageHeader>
      <div className="px-5 md:px-10 pb-12">
        {live ? (
          liveInterests === undefined ? (
            <div className="flex items-center gap-2 py-10 text-muted-foreground" role="status">
              <LoaderCircle className="animate-spin" size={16} /> Loading your interest tracker…
            </div>
          ) : liveInterests.filter((i) => i.status !== "withdrawn").length ? (
            <>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-6">
                {(["interested", "conversation", "accepted", "declined"] as const).map((st) => (
                  <div key={st} className={cn("rounded-xl px-3 py-3", tone[st])}>
                    <p className="font-mono text-2xl">{liveInterests.filter((i) => i.status === st).length}</p>
                    <p className="text-[11px] uppercase tracking-wider">{STATUS_LABEL[st]}</p>
                  </div>
                ))}
              </div>
              <ul className="space-y-3">
                {liveInterests.map((i) => (
                  <li key={i.interestId} data-testid={`row-interest-${i.interestId}`} className="lift rise rounded-2xl border bg-card p-5 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{i.department}</p>
                      <h3 className="font-display text-lg mt-1">{i.title}</h3>
                      <p className="text-xs text-muted-foreground">{i.faculty} · Updated {format(new Date(i.updatedAt), "MMM d, h:mm a")}</p>
                    </div>
                    <span className={cn("rounded-full px-4 py-1.5 text-sm font-medium", tone[i.status])}>
                      {STATUS_LABEL[i.status]}
                    </span>
                    {i.status !== "withdrawn" && (
                      <button
                        data-testid={`button-withdraw-${i.interestId}`}
                        onClick={async () => {
                          try {
                            await withdraw({ interestId: i.interestId as never });
                          } catch {
                            toast({ title: "Couldn\u2019t withdraw", variant: "destructive" });
                          }
                        }}
                        aria-label="Withdraw interest"
                        className="h-10 w-10 grid place-items-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState title="No interest sent yet" body="Show interest on any lab in Discover. Faculty see your request and status updates appear here." action={<Link href="/student" data-testid="link-discover" className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm inline-block hover:opacity-90">Find a lab</Link>} />
          )
        ) : mine.length ? (
          <>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
              {STAGES.map((s) => (
                <div key={s} className={cn("rounded-xl px-3 py-3", tone[s])}>
                  <p className="font-mono text-2xl">{mine.filter((i) => i.status === s).length}</p>
                  <p className="text-[11px] uppercase tracking-wider">{STATUS_LABEL[s]}</p>
                </div>
              ))}
            </div>
            <ul className="space-y-3">
              {mine.map((i, idx) => {
                const p = projects.find((x) => x.id === i.projectId);
                if (!p) return null;
                return (
                  <li key={i.id} data-testid={`row-interest-${i.id}`} style={{ animationDelay: `${idx * 40}ms` }} className="lift rise rounded-2xl border bg-card p-5 flex flex-col md:flex-row md:items-center gap-4">
                    <button data-testid={`button-open-${p.id}`} onClick={() => setOpen(p)} className="text-left flex-1 min-w-0 group">
                      <div className="flex items-center gap-2"><RecruitPill status={p.status} /><span className="text-xs text-muted-foreground">{p.department}</span></div>
                      <h3 className="font-display text-lg mt-1 group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-xs text-muted-foreground">Updated {format(new Date(i.updatedAt), "MMM d, h:mm a")}</p>
                    </button>
                    <select
                      data-testid={`select-status-${i.id}`}
                      value={i.status}
                      onChange={(e) => setInterestStatus(i.id, e.target.value as InterestStatus)}
                      className={cn("h-10 rounded-full px-4 text-sm font-medium border-0 cursor-pointer", tone[i.status])}
                    >
                      {STAGES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                    <button data-testid={`button-remove-${i.id}`} onClick={() => removeInterest(i.id)} aria-label="Remove" className="h-10 w-10 grid place-items-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"><Trash2 className="h-4 w-4" /></button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <EmptyState title="No interest sent yet" body="Open any project and use Express interest. It will appear here and in the faculty workspace." action={<Link href="/" data-testid="link-discover" className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm inline-block hover:opacity-90">Find a lab</Link>} />
        )}
      </div>
      <ProjectDialog project={open} onClose={() => setOpen(null)} />
    </Layout>
  );
}
