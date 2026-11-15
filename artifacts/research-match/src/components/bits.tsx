import { useState } from "react";
import { Link } from "wouter";
import { Bookmark, BookmarkCheck, Check, Clock, GraduationCap, DollarSign, HeartHandshake, Sprout, Send } from "lucide-react";
import type { Project, RecruitStatus } from "@/lib/data";
import type { MatchResult } from "@/lib/matching";
import { useStore } from "@/lib/store";
import { useAccount } from "@/lib/auth";
import { useMutation, useQuery } from "@/lib/backend";
import { api } from "@/lib/convex-api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function RecruitPill({ status }: { status: RecruitStatus }) {
  const map: Record<string, [string, string]> = {
    open: ["Open recruiting", "bg-chart-3/12 text-chart-3 border-chart-3/30"],
    exploration: ["Lab exploration", "bg-accent text-accent-foreground border-chart-2/40"],
    closed: ["Closed this term", "bg-muted text-muted-foreground border-border"],
  };
  const [label, cls] = map[status] ?? ["Reviewing", "bg-muted text-muted-foreground border-border"];
  return (
    <span data-testid={`status-recruit-${status}`} className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "open" ? "bg-chart-3" : status === "exploration" ? "bg-chart-2" : "bg-muted-foreground")} />
      {label}
    </span>
  );
}

export function ScoreDial({ score, size = 56 }: { score: number; size?: number }) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title="Demo match score">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={5} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={score >= 70 ? "hsl(var(--primary))" : score >= 50 ? "hsl(var(--chart-2))" : "hsl(var(--muted-foreground))"}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-mono text-sm font-medium">{Math.round(score)}</span>
    </div>
  );
}

export function SaveButton({ id }: { id: string }) {
  const { saved, toggleSave } = useStore();
  const on = saved.includes(id);
  const Icon = on ? BookmarkCheck : Bookmark;
  return (
    <button
      data-testid={`button-save-${id}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleSave(id);
      }}
      aria-label={on ? "Remove from saved" : "Save project"}
      className={cn(
        "h-9 w-9 grid place-items-center rounded-full border transition-all duration-200 hover:scale-110 active:scale-95",
        on ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:text-primary hover:border-primary/40",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function InterestButton({
  projectId,
  open,
}: {
  projectId: string;
  open: boolean;
}) {
  const account = useAccount();
  const realStudent =
    account.isAuthenticated &&
    account.viewer?.accountType === "student" &&
    account.viewer.hasStudentProfile;
  const mine = useQuery(
    api.interests.myInterests,
    realStudent ? {} : "skip",
  );
  const express = useMutation(api.interests.expressInterest);
  const { interests, profile, expressInterest: localExpress } = useStore();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const record = mine?.find((i) => i.sourceId === projectId && i.status !== "withdrawn");

  if (record)
    return (
      <span className="inline-flex items-center gap-1.5 border border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
        <Check size={14} /> Interest sent
      </span>
    );
  if (!open)
    return (
      <span className="inline-flex items-center gap-1.5 border border-dashed px-3 py-1.5 text-xs text-muted-foreground">
        Not accepting interest
      </span>
    );
  if (!account.isAuthenticated)
    return (
      <Link href="/sign-in" className="inline-flex items-center gap-1.5 border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5">
        Sign in to show interest
      </Link>
    );
  return (
    <button
      data-testid={`button-interest-${projectId}`}
      disabled={sending}
      onClick={async (e) => {
        e.stopPropagation();
        setSending(true);
        try {
          if (realStudent) {
            await express({ sourceId: projectId });
            toast({ title: "Interest sent", description: "Track it in your Interest tracker." });
          } else {
            localExpress(projectId, "Hi! I'm interested in this opportunity.");
            toast({ title: "Interest recorded locally", description: "Sign in with your USC account to send it for real." });
          }
        } catch {
          toast({ title: "Couldn't send interest", variant: "destructive" });
        } finally {
          setSending(false);
        }
      }}
      className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
    >
      <Send size={14} /> Show Interest
    </button>
  );
}

function ProjectCard({ p, m, onOpen, i = 0 }: { p: Project; m: MatchResult; onOpen: () => void; i?: number }) {
  return (
    <article
      data-testid={`card-project-${p.id}`}
      onClick={onOpen}
      style={{ animationDelay: `${i * 45}ms` }}
      className={cn("lift rise group cursor-pointer rounded-2xl border bg-card p-5 flex flex-col gap-3", p.status === "closed" && "opacity-75")}
    >
      <div className="flex items-start gap-4">
        <ScoreDial score={m.score} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <RecruitPill status={p.status} />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{p.department}</span>
          </div>
          <h3 className="font-display text-lg leading-snug mt-1.5 group-hover:text-primary transition-colors">{p.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{p.lab}</p>
        </div>
        <SaveButton id={p.id} />
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">{p.summary}</p>
      <div className="flex flex-wrap gap-1.5">
        {p.requiredSkills.map((s) => (
          <span key={s} className={cn("rounded-md px-2 py-1 text-sm border", m.matchedSkills.includes(s) ? "bg-primary/8 border-primary/25 text-primary" : "border-dashed text-muted-foreground")}>
            {s}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground pt-2 border-t border-dashed">
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.minHours}-{p.maxHours} h/wk</span>
        {p.credit && <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />Credit</span>}
        {p.paid && <span className="inline-flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />Paid</span>}
        {p.volunteer && <span className="inline-flex items-center gap-1"><HeartHandshake className="h-3.5 w-3.5" />Volunteer</span>}
        {m.learningPotential && <span className="inline-flex items-center gap-1 text-chart-3 font-medium"><Sprout className="h-3.5 w-3.5" />Learning potential</span>}
        <span className="ml-auto text-primary font-medium opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">Why this match</span>
        <InterestButton projectId={p.sourceId ?? p.id} open={p.status !== "closed"} />
      </div>
    </article>
  );
}

export function ProjectGrid({
  list,
  onOpen,
  className,
}: {
  list: { p: Project; m: MatchResult }[];
  onOpen: (p: Project) => void;
  className: string;
}) {
  return (
    <div className={cn("grid gap-4", className)}>
      {list.map(({ p, m }, i) => (
        <ProjectCard key={p.id} p={p} m={m} i={i} onOpen={() => onOpen(p)} />
      ))}
    </div>
  );
}
