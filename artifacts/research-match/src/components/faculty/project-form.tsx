import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DEPARTMENTS, type Level, type Project, type RecruitStatus } from "@/lib/data";

const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export function ProjectForm({ initial, onSave, onCancel }: { initial: Project | null; onSave: (p: Project) => void; onCancel: () => void }) {
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
