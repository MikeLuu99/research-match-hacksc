import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Lock } from "lucide-react";
import { Layout, PageHeader, EmptyState } from "@/components/layout";
import { RecruitPill, ScoreDial } from "@/components/bits";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { STATUS_LABEL, useStore, type InterestStatus } from "@/lib/store";
import { DEMO_STUDENTS, DEPARTMENTS, type Level, type Project, type RecruitStatus } from "@/lib/data";
import { matchProject } from "@/lib/matching";
import { cn } from "@/lib/utils";

const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function ProjectForm({ initial, onSave, onCancel }: { initial: Project | null; onSave: (p: Project) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    title: initial?.title ?? "",
    lab: initial?.lab ?? "",
    pi: initial?.pi ?? "",
    department: initial?.department ?? DEPARTMENTS[0],
    summary: initial?.summary ?? "",
    description: initial?.description ?? "",
    requiredSkills: initial?.requiredSkills.join(", ") ?? "",
    niceSkills: initial?.niceSkills.join(", ") ?? "",
    keywords: initial?.keywords.join(", ") ?? "",
    eligibleMajors: initial?.eligibleMajors.join(", ") ?? "Any",
    minHours: String(initial?.minHours ?? 6),
    maxHours: String(initial?.maxHours ?? 10),
    paid: initial?.paid ?? false,
    credit: initial?.credit ?? true,
    status: (initial?.status ?? "open") as RecruitStatus,
    level: (initial?.level ?? "beginner") as Level,
  });
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const input = "mt-1 w-full h-10 rounded-lg border bg-background px-3 text-sm font-normal";
  const submit = () => {
    const min = Number(f.minHours), max = Number(f.maxHours);
    if (!f.title.trim() || !f.lab.trim() || !f.summary.trim()) return setErr("Title, lab and summary are required.");
    if (!(min > 0) || max < min) return setErr("Hours must be positive and max at least min.");
    onSave({
      id: initial?.id ?? "p-" + Date.now(),
      title: f.title.trim(), lab: f.lab.trim(), pi: f.pi.trim() || "Faculty (demo)", department: f.department,
      summary: f.summary.trim(), description: f.description.trim() || f.summary.trim(),
      requiredSkills: csv(f.requiredSkills), niceSkills: csv(f.niceSkills), keywords: csv(f.keywords),
      eligibleMajors: csv(f.eligibleMajors).length ? csv(f.eligibleMajors) : ["Any"],
      minHours: min, maxHours: max, paid: f.paid, credit: f.credit, status: f.status, level: f.level,
    });
  };
  return (
    <div className="grid md:grid-cols-2 gap-3 text-sm font-semibold">
      <label className="md:col-span-2">Title<input data-testid="input-project-title" className={input} value={f.title} onChange={set("title")} /></label>
      <label>Lab<input data-testid="input-project-lab" className={input} value={f.lab} onChange={set("lab")} /></label>
      <label>PI<input data-testid="input-project-pi" className={input} value={f.pi} onChange={set("pi")} /></label>
      <label>Department<select data-testid="select-project-dept" className={input} value={f.department} onChange={set("department")}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></label>
      <label>Recruiting status<select data-testid="select-project-status" className={input} value={f.status} onChange={set("status")}><option value="open">Open recruiting</option><option value="exploration">Lab exploration</option><option value="closed">Closed</option></select></label>
      <label className="md:col-span-2">Summary<input data-testid="input-project-summary" className={input} value={f.summary} onChange={set("summary")} /></label>
      <label className="md:col-span-2">Description<Textarea data-testid="input-project-description" rows={3} className="mt-1 font-normal bg-background" value={f.description} onChange={set("description")} /></label>
      <label>Required skills (comma)<input data-testid="input-project-required" className={input} value={f.requiredSkills} onChange={set("requiredSkills")} /></label>
      <label>Nice-to-have skills<input data-testid="input-project-nice" className={input} value={f.niceSkills} onChange={set("niceSkills")} /></label>
      <label>Keywords<input data-testid="input-project-keywords" className={input} value={f.keywords} onChange={set("keywords")} /></label>
      <label>Eligible majors<input data-testid="input-project-majors" className={input} value={f.eligibleMajors} onChange={set("eligibleMajors")} /></label>
      <label>Min h/week<input data-testid="input-project-min" type="number" className={input} value={f.minHours} onChange={set("minHours")} /></label>
      <label>Max h/week<input data-testid="input-project-max" type="number" className={input} value={f.maxHours} onChange={set("maxHours")} /></label>
      <label>Level<select data-testid="select-project-level" className={input} value={f.level} onChange={set("level")}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
      <div className="flex items-end gap-4 font-normal pb-2">
        <label className="flex items-center gap-2"><input data-testid="check-project-paid" type="checkbox" checked={f.paid} onChange={(e) => setF({ ...f, paid: e.target.checked })} />Paid</label>
        <label className="flex items-center gap-2"><input data-testid="check-project-credit" type="checkbox" checked={f.credit} onChange={(e) => setF({ ...f, credit: e.target.checked })} />Credit</label>
      </div>
      {err && <p className="md:col-span-2 text-destructive text-xs font-normal">{err}</p>}
      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel} data-testid="button-cancel-project">Cancel</Button>
        <Button onClick={submit} data-testid="button-submit-project">{initial ? "Save changes" : "Create project"}</Button>
      </div>
    </div>
  );
}

const FAC_STAGES: InterestStatus[] = ["interested", "conversation", "accepted", "declined"];

export default function Faculty() {
  const { projects, profile, interests, upsertProject, removeProject, setInterestStatus } = useStore();
  const { toast } = useToast();
  const [selId, setSelId] = useState<string | null>(projects[0]?.id ?? null);
  const [editing, setEditing] = useState<Project | null | "new">(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const sel = projects.find((p) => p.id === selId) ?? projects[0] ?? null;

  const pool = useMemo(() => [...DEMO_STUDENTS, ...(profile.visible ? [profile] : [])], [profile]);
  const candidates = useMemo(
    () => (sel ? pool.map((s) => ({ s, m: matchProject(s, sel) })).filter((x) => x.m.eligible).sort((a, b) => b.m.score - a.m.score) : []),
    [pool, sel],
  );
  const requests = sel ? interests.filter((i) => i.projectId === sel.id) : [];

  return (
    <Layout>
      <PageHeader eyebrow="Faculty workspace · demo" title="Find students who already have the skills">
        Manage fictional lab listings, see opted-in candidates ranked by demo matching, and respond to interest requests.
      </PageHeader>
      <div className="px-5 md:px-10 pb-12 grid lg:grid-cols-[320px_1fr] gap-6">
        <aside className="space-y-2">
          <Button data-testid="button-new-project" onClick={() => setEditing("new")} className="w-full mb-2"><Plus className="h-4 w-4 mr-1" />New project</Button>
          {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects. Create one to start.</p>}
          {projects.map((p) => {
            const n = interests.filter((i) => i.projectId === p.id && i.status === "interested").length;
            return (
              <button key={p.id} data-testid={`button-select-${p.id}`} onClick={() => setSelId(p.id)}
                className={cn("w-full text-left rounded-xl border p-3 transition-all duration-200 hover:translate-x-1", sel?.id === p.id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary/40")}>
                <p className="text-sm font-semibold leading-snug">{p.title}</p>
                <div className="flex items-center justify-between mt-1 text-[11px] opacity-80">
                  <span>{p.status === "open" ? "Open" : p.status === "exploration" ? "Exploration" : "Closed"} · {p.department}</span>
                  {n > 0 && <span className="font-mono rounded-full bg-chart-2 text-accent-foreground px-1.5">{n} new</span>}
                </div>
              </button>
            );
          })}
        </aside>

        {sel ? (
          <div className="space-y-6 min-w-0">
            <section className="rounded-2xl border bg-card p-6 rise" key={sel.id}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-0">
                  <RecruitPill status={sel.status} />
                  <h2 className="font-display text-2xl mt-2">{sel.title}</h2>
                  <p className="text-sm text-muted-foreground">{sel.lab} · {sel.minHours}-{sel.maxHours} h/wk · {sel.credit ? "credit" : "no credit"} · {sel.paid ? "paid" : "unpaid"}</p>
                </div>
                <Button variant="outline" size="sm" data-testid="button-edit-project" onClick={() => setEditing(sel)}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
                <Button variant="outline" size="sm" data-testid="button-delete-project" onClick={() => setDeleting(sel)} className="hover:text-destructive hover:border-destructive/40"><Trash2 className="h-3.5 w-3.5 mr-1" />Remove</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">{sel.requiredSkills.map((s) => <span key={s} className="rounded-md border px-2 py-0.5 text-xs">{s}</span>)}</div>
            </section>

            <section>
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-display text-xl">Interest requests</h3>
                <span className="text-xs font-mono text-muted-foreground">{requests.length}</span>
              </div>
              {requests.length ? (
                <ul className="space-y-2">
                  {requests.map((r) => (
                    <li key={r.id} data-testid={`row-request-${r.id}`} className="rounded-xl border bg-card p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{r.studentName}</p>
                        <span className="text-xs text-muted-foreground">{r.studentId === profile.id ? "sample student" : "fictional demo student"}</span>
                        <span className="ml-auto text-xs rounded-full bg-accent text-accent-foreground px-2 py-0.5">{STATUS_LABEL[r.status]}</span>
                      </div>
                      {r.message && <p className="mt-2 text-xs text-muted-foreground line-clamp-3 whitespace-pre-line">{r.message}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {FAC_STAGES.map((s) => (
                          <button key={s} data-testid={`button-request-${s}-${r.id}`} onClick={() => { setInterestStatus(r.id, s); toast({ title: `Marked ${STATUS_LABEL[s].toLowerCase()}` }); }}
                            className={cn("rounded-full border px-3 py-1 text-xs transition hover:-translate-y-px", r.status === s ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/40")}>
                            {STATUS_LABEL[s]}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <EmptyState title="No requests yet" body="When a student expresses interest in this project, it lands here." />}
            </section>

            <section>
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-display text-xl">Recommended candidates</h3>
                <span className="text-[11px] font-mono text-muted-foreground">Demo matching · opted-in only</span>
              </div>
              {!profile.visible && (
                <p className="mb-3 flex items-center gap-2 text-xs rounded-lg bg-secondary px-3 py-2"><Lock className="h-3.5 w-3.5" />{profile.name} is private and hidden. They can opt in from their profile.</p>
              )}
              {candidates.length ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {candidates.map(({ s, m }, i) => (
                    <div key={s.id} data-testid={`card-candidate-${s.id}`} style={{ animationDelay: `${i * 50}ms` }} className="lift rise rounded-xl border bg-card p-4 flex gap-3">
                      <ScoreDial score={m.score} size={50} />
                      <div className="min-w-0">
                        <p className="font-semibold">{s.name} <span className="text-xs font-normal text-muted-foreground">{s.id === profile.id ? "(sample student)" : "(fictional)"}</span></p>
                        <p className="text-xs text-muted-foreground">{s.major} · {s.year} · {s.hours} h/wk</p>
                        <p className="text-xs mt-2"><span className="text-chart-3 font-medium">Transferable:</span> {m.matchedSkills.concat(m.niceMatched).join(", ") || "interest overlap only"}</p>
                        {m.gaps.length > 0 && <p className="text-xs text-muted-foreground">Would learn: {m.gaps.join(", ")}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="No eligible opted-in students" body="Loosen eligible majors to widen the pool." />}
            </section>
          </div>
        ) : (
          <EmptyState title="No projects" body="Create your first listing to see candidates." />
        )}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[92dvh] overflow-y-auto">
          <DialogTitle className="font-display text-2xl">{editing === "new" ? "New project" : "Edit project"}</DialogTitle>
          <DialogDescription>Stored locally in this browser.</DialogDescription>
          {editing !== null && (
            <ProjectForm
              initial={editing === "new" ? null : editing}
              onCancel={() => setEditing(null)}
              onSave={(p) => { upsertProject(p); setSelId(p.id); setEditing(null); toast({ title: "Project saved" }); }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Remove this project?</AlertDialogTitle>
          <AlertDialogDescription>"{deleting?.title}" and its interest requests will be removed from this browser.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction data-testid="button-confirm-delete" onClick={() => { if (deleting) { removeProject(deleting.id); setSelId(null); toast({ title: "Project removed" }); } setDeleting(null); }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
