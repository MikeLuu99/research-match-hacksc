import { useState } from "react";
import { Layout, PageHeader, EmptyState } from "@/components/layout";
import { useStore, STATUS_LABEL, type InterestStatus } from "@/lib/store";
import { demoStudents } from "@/lib/faculty-access";
import { useFacultyMode } from "@/lib/faculty-mode";
import { DEMO_STUDENTS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LocalNotice } from "@/components/faculty/demo-notice";
import { StudentDetailBody } from "@/components/faculty/student-detail";

const FAC_STAGES: InterestStatus[] = ["interested", "conversation", "accepted", "declined"];
const sel = "mt-1 h-10 w-full border border-primary/25 bg-card px-3 text-sm font-normal";
const lbl = "mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary";

export default function FacultyInbox() {
  const live = useFacultyMode() === "live";
  const { projects, profile, interests, setInterestStatus } = useStore();
  const { toast } = useToast();
  const [pf, setPf] = useState("all");
  const [sf, setSf] = useState<"all" | InterestStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const owned = interests.filter((i) => projects.some((p) => p.id === i.projectId));
  const list = owned.filter((i) => (pf === "all" || i.projectId === pf) && (sf === "all" || i.status === sf));
  const cur = list.find((i) => i.id === openId) ?? null;
  // Demo student details only resolve in demo mode; live never shows fixtures.
  const student = cur && !live ? demoStudents(DEMO_STUDENTS, profile).find((s) => s.id === cur.studentId) ?? null : null;
  const project = cur ? projects.find((p) => p.id === cur.projectId) ?? null : null;
  const count = (s: InterestStatus) => owned.filter((i) => i.status === s).length;

  return (
    <Layout>
      <PageHeader eyebrow={live ? "Interest inbox · browser-local" : "Interest inbox · demo"} title="Who raised a hand">
        Requests across your listings. Review the message and set a status.
      </PageHeader>
      <div className="space-y-5 px-5 pb-12 md:px-10">
        <LocalNotice>
          {live
            ? "Browser-local only. Live student interest is not delivered to faculty accounts yet, so this inbox only holds requests recorded in this browser. Status changes are not synced or sent to students."
            : "Local demo only. Requests were recorded in the student view of this browser. Nothing is delivered, emailed or synced."}
        </LocalNotice>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {([["Total", owned.length], ...FAC_STAGES.map((s) => [STATUS_LABEL[s], count(s)])] as [string, number][]).map(([l, n], i) => (
            <div key={l} className={cn("border p-3", i === 0 ? "border-sidebar bg-sidebar text-sidebar-foreground" : "bg-card")}><p className={cn("font-display text-3xl", i === 0 && "text-sidebar-primary")}>{n}</p><p className="font-mono text-[10px] uppercase tracking-wider opacity-70">{l}</p></div>
          ))}
        </div>
        <div className="grid max-w-xl gap-3 text-xs font-semibold sm:grid-cols-2">
          <label>Lab listing<select data-testid="select-inbox-project" className={sel} value={pf} onChange={(e) => setPf(e.target.value)}><option value="all">All listings ({projects.length})</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
          <label>Status<select data-testid="select-inbox-status" className={sel} value={sf} onChange={(e) => setSf(e.target.value as "all" | InterestStatus)}><option value="all">Any status</option>{(Object.keys(STATUS_LABEL) as InterestStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></label>
        </div>
        {list.length === 0 ? <EmptyState title="No requests here" body={live ? "No requests are recorded in this browser for your listings." : "When a student sends interest in one of your open projects, it appears in this inbox."} /> : (
          <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
            <ul className="space-y-2">
              {list.map((r) => {
                const proj = projects.find((p) => p.id === r.projectId);
                return (
                  <li key={r.id}>
                    <button data-testid={`row-request-${r.id}`} onClick={() => setOpenId(r.id)} aria-pressed={openId === r.id}
                      className={cn("w-full border bg-card p-4 text-left transition-colors hover:border-primary/40", openId === r.id && "border-primary")}>
                      <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{r.studentName}</p>{!live && <span className="text-xs text-muted-foreground">{r.studentId === profile.id ? "sample student" : "fictional"}</span>}<span className="ml-auto bg-accent px-2 py-0.5 text-xs text-accent-foreground">{STATUS_LABEL[r.status]}</span></div>
                      <p className="mt-0.5 text-xs text-primary">{proj?.title}</p>
                      {r.message && <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground">{r.message}</p>}
                      <p className="mt-2 font-mono text-[10px] text-muted-foreground">{new Date(r.updatedAt).toLocaleDateString()}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
            <aside className="border border-primary/20 bg-card p-5 lg:sticky lg:top-6">
              {cur ? (
                <div className="rise space-y-4" key={cur.id}>
                  <div>
                    <p className={lbl}>Set status</p>
                    <div className="flex flex-wrap gap-1.5">
                      {FAC_STAGES.map((s) => (
                        <button key={s} data-testid={`button-request-${s}-${cur.id}`} disabled={cur.status === "withdrawn"} onClick={() => { setInterestStatus(cur.id, s); toast({ title: `Marked ${STATUS_LABEL[s].toLowerCase()}` }); }}
                          className={cn("border px-3 py-1 text-xs transition-colors disabled:opacity-40", cur.status === s ? "border-primary bg-primary text-primary-foreground" : "border-primary/25 hover:bg-primary/5")}>{STATUS_LABEL[s]}</button>
                      ))}
                    </div>
                    {cur.status === "withdrawn" && <p className="mt-2 text-xs text-muted-foreground">The student withdrew this request.</p>}
                  </div>
                  <div><p className={lbl}>Request message</p><p className="max-h-56 overflow-y-auto whitespace-pre-line bg-secondary/60 p-3 text-xs">{cur.message || "No message."}</p></div>
                  {student ? <StudentDetailBody s={student} project={project} /> : <p className="text-sm text-muted-foreground">Student details are not available for this request.</p>}
                </div>
              ) : <p className="py-10 text-center text-sm text-muted-foreground">Select a request to see the message and student details.</p>}
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
