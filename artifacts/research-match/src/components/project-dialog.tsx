import { useEffect, useState } from "react";
import { Check, CircleDashed, Copy, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@/lib/data";
import { defaultTemplate, matchProject } from "@/lib/matching";
import { STATUS_LABEL, useStore } from "@/lib/store";
import { InterestButton, RecruitPill, SaveButton, ScoreDial } from "./bits";
import { useAccount } from "@/lib/auth";
import { useQuery } from "@/lib/backend";
import { api } from "@/lib/convex-api";

export function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const { profile, templates, setTemplate, interests } = useStore();
  const account = useAccount();
  const live = account.isAuthenticated && account.viewer?.accountType === "student" && account.viewer.hasStudentProfile;
  const liveInterests = useQuery(api.interests.myInterests, live ? {} : "skip");
  const { toast } = useToast();
  const [text, setText] = useState("");
  const m = project ? matchProject(profile, project) : null;
  const pid = project?.id;

  useEffect(() => {
    if (project && m) setText(templates[project.id] ?? defaultTemplate(profile, project, m));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  if (!project || !m) return <Dialog open={false} />;
  const mine = live
    ? liveInterests?.find((i) => i.sourceId === (project.sourceId ?? project.id))
    : interests.find((i) => i.projectId === project.id && i.studentId === profile.id);
  const hoursLabel = { fits: "Fits your availability", under: "Needs more hours than you have", over: "You have spare hours" }[m.hoursFit];

  return (
    <Dialog open={!!project} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92dvh] overflow-y-auto p-0 gap-0 bg-card">
        <div className="p-6 md:p-8 bg-gradient-to-br from-secondary via-card to-card border-b">
          <div className="flex items-start gap-4">
            <ScoreDial score={m.score} size={68} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 items-center">
                <RecruitPill status={project.status} />
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{project.department} · {project.level}</span>
              </div>
              <DialogTitle className="font-display text-2xl md:text-3xl mt-2 leading-tight">{project.title}</DialogTitle>
              <DialogDescription className="mt-1">{project.lab} — {project.pi}</DialogDescription>
            </div>
            <SaveButton id={project.sourceId ?? project.id} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/85">{project.description}</p>
          <p className="mt-3 text-[11px] font-mono text-muted-foreground">
            Demo matching · text cosine {m.textSimilarity.toFixed(3)} · local text vectors, not live AI embeddings
          </p>
        </div>

        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6">
          <section>
            <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-primary mb-2">Your strengths here</h4>
            <ul className="space-y-1.5 text-sm">
              {m.strengths.length ? m.strengths.map((s) => (
                <li key={s} className="flex gap-2"><Check className="h-4 w-4 mt-0.5 text-chart-3 shrink-0" />{s}</li>
              )) : <li className="text-muted-foreground">No direct overlap yet — add skills on your profile.</li>}
            </ul>
          </section>
          <section>
            <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-primary mb-2">Required skill gaps</h4>
            {m.gaps.length ? (
              <ul className="space-y-1.5 text-sm">
                {m.gaps.map((g) => <li key={g} className="flex gap-2"><CircleDashed className="h-4 w-4 mt-0.5 text-chart-2 shrink-0" />{g}</li>)}
              </ul>
            ) : <p className="text-sm">None — you cover every required skill.</p>}
            {m.learningPotential && <p className="mt-2 text-xs rounded-lg bg-chart-3/10 text-chart-3 px-3 py-2">Beginner project: the lab expects to teach these. Gaps count less in your score.</p>}
          </section>
          <dl className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["Hours", `${project.minHours}-${project.maxHours} h/wk`, hoursLabel],
              ["Academic credit", project.credit ? "Offered" : "Not offered", m.creditFit === null ? "You didn't request credit" : m.creditFit ? "Matches your preference" : "You requested credit"],
              ["Compensation", project.paid ? (project.volunteer ? "Paid or volunteer" : "Paid") : project.volunteer ? "Volunteer" : "Unpaid", m.paidFit === false ? "You prefer paid" : ""],
              ["Eligibility", m.eligible ? "Eligible" : "Check with PI", project.eligibleMajors.join(", ")],
            ].map(([k, v, sub]) => (
              <div key={k} className="rounded-xl border bg-background/60 p-3">
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="font-semibold mt-0.5 text-sm">{v}</dd>
                {sub && <dd className="text-[11px] text-muted-foreground mt-0.5">{sub}</dd>}
              </div>
            ))}
          </dl>
          {m.notes.length > 0 && (
            <ul className="md:col-span-2 text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
              {m.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          )}

          <section className="md:col-span-2">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-primary">Outreach template</h4>
              <span className="text-[10px] font-mono uppercase rounded border px-1.5 py-0.5 text-muted-foreground">Template · not AI-generated</span>
            </div>
            <Textarea data-testid="input-outreach" value={text} onChange={(e) => setText(e.target.value)} rows={10} className="font-mono text-xs leading-relaxed bg-background/60" />
            <div className="flex flex-wrap gap-2 mt-2">
              <Button variant="outline" size="sm" data-testid="button-save-template" onClick={() => { setTemplate(project.id, text); toast({ title: "Template saved locally" }); }}>Save edits</Button>
              <Button variant="ghost" size="sm" data-testid="button-reset-template" onClick={() => { setTemplate(project.id, null); setText(defaultTemplate(profile, project, m)); }}><RotateCcw className="h-3.5 w-3.5 mr-1" />Reset</Button>
              <Button variant="ghost" size="sm" data-testid="button-copy-template" onClick={() => { navigator.clipboard?.writeText(text); toast({ title: "Copied to clipboard" }); }}><Copy className="h-3.5 w-3.5 mr-1" />Copy</Button>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 border-t bg-card/95 backdrop-blur px-6 md:px-8 py-4 flex flex-wrap items-center gap-3 justify-between">
          <p className="text-xs text-muted-foreground">
            {mine ? `Status: ${STATUS_LABEL[mine.status]}` : project.status === "closed" ? "Recruiting is closed; save it to revisit next term." : project.status === "exploration" ? "Lab information only; no verified opening. You can express interest for future opportunities." : "Track your request and faculty updates in your Interest tracker."}
          </p>
          <InterestButton projectId={project.sourceId ?? project.id} open={project.status !== "closed"} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
