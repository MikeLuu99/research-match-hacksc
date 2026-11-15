import { useRef, useState } from "react";
import { useMutation, useQuery } from "@/lib/backend";
import { format } from "date-fns";
import { LoaderCircle } from "lucide-react";
import { Layout, PageHeader, EmptyState } from "@/components/layout";
import { useStore, STATUS_LABEL, type InterestStatus } from "@/lib/store";
import { demoStudents } from "@/lib/faculty-access";
import { useFacultyMode } from "@/lib/faculty-mode";
import { DEMO_STUDENTS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/convex-api";
import { cn } from "@/lib/utils";
import { LocalNotice } from "@/components/faculty/demo-notice";
import { StudentDetailBody } from "@/components/faculty/student-detail";
import { ScoreDial } from "@/components/bits";
import { matchProject } from "@/lib/matching";

const FAC_STAGES: InterestStatus[] = ["interested", "conversation", "accepted", "declined"];
const sel = "mt-1 h-10 w-full border border-primary/25 bg-card px-3 text-sm font-normal";
const lbl = "mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary";

const compatCls = (n: number) =>
  n >= 70
    ? "border-primary/40 bg-primary/10 text-primary"
    : n >= 50
      ? "border-chart-2/40 bg-chart-2/10 text-foreground"
      : "border-muted-foreground/30 text-muted-foreground";

export default function FacultyInbox() {
  const live = useFacultyMode() === "live";
  const liveInbox = useQuery(api.interests.labInbox, live ? {} : "skip");
  const liveStatus = useMutation(api.interests.setInterestStatus);
  const { projects, profile, interests, setInterestStatus } = useStore();
  const { toast } = useToast();
  const [pf, setPf] = useState("all");
  const [sf, setSf] = useState<"all" | InterestStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  type Row = {
    id: string;
    projectId: string;
    projectTitle: string;
    studentName: string;
    status: InterestStatus;
    studentId?: string;
    updatedAt: number;
    studentMajor?: string;
    studentSchoolYear?: string;
    studentSkills?: string[];
    studentSchedule?: string;
    studentBio?: string;
    studentMinors?: string[];
    studentInterests?: string[];
    studentExperience?: { role: string; org: string; description: string }[];
    studentHoursPerWeek?: number;
    studentSeekingCredit?: boolean;
    studentWorkStudy?: boolean;
    compatibility?: number;
    message?: string;
    demo: boolean;
  };
  const owned = interests.filter((i) => projects.some((p) => p.id === i.projectId));
  const pool = demoStudents(DEMO_STUDENTS, profile);
  // Demo compatibility uses the same local matcher as Discover students.
  const demoScore = (studentId: string, projectId: string) => {
    const s = pool.find((x) => x.id === studentId);
    const p = projects.find((x) => x.id === projectId);
    return s && p ? Math.round(matchProject(s, p).score) : undefined;
  };
  const demoRows: Row[] = owned.map((i) => ({
    id: i.id,
    projectId: i.projectId,
    projectTitle: projects.find((p) => p.id === i.projectId)?.title ?? i.projectId,
    studentId: i.studentId,
    studentName: i.studentName,
    status: i.status,
    updatedAt: Date.parse(i.updatedAt),
    message: i.message,
    compatibility: demoScore(i.studentId, i.projectId),
    demo: true,
  }));
  const liveRows: Row[] = (liveInbox ?? []).map((r) => ({
    id: r.interestId,
    projectId: r.projectId,
    projectTitle: r.projectTitle,
    studentName: r.studentName,
    status: r.status,
    updatedAt: r.updatedAt,
    studentMajor: r.studentMajor,
    studentSchoolYear: r.studentSchoolYear,
    studentSkills: r.studentSkills,
    studentSchedule: r.studentSchedule,
    studentBio: r.studentBio,
    studentMinors: r.studentMinors,
    studentInterests: r.studentInterests,
    studentExperience: r.studentExperience,
    studentHoursPerWeek: r.studentHoursPerWeek,
    studentSeekingCredit: r.studentSeekingCredit,
    studentWorkStudy: r.studentWorkStudy,
    compatibility: r.compatibility,
    demo: false,
  }));
  const all = live ? liveRows : demoRows;
  const list = all.filter((i) => (pf === "all" || i.projectId === pf) && (sf === "all" || i.status === sf));
  const cur = list.find((i) => i.id === openId) ?? null;
  // Demo student details only resolve in demo mode; live never shows fixtures.

  const project = cur ? projects.find((p) => p.id === cur.projectId) ?? null : null;
  const count = (s: InterestStatus) => all.filter((i) => i.status === s).length;

  return (
    <Layout>
      <PageHeader eyebrow={live ? "Interest inbox" : "Interest inbox · demo"} title="Interest Box">
        {live
          ? "Real student interest in your own project listings. Update a status and the student sees it in their tracker."
          : "Requests across your listings. Review the message and set a status."}
      </PageHeader>
      <div className="space-y-5 px-5 pb-12 md:px-10">
        {!live && (
          <LocalNotice>
            Local demo only. Requests were recorded in the student view of this browser. Nothing is delivered, emailed or synced.
          </LocalNotice>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {([["Total", all.length], ...FAC_STAGES.map((s) => [STATUS_LABEL[s], count(s)])] as [string, number][]).map(([l, n], i) => (
            <div key={l} className={cn("border p-3", i === 0 ? "border-sidebar bg-sidebar text-sidebar-foreground" : "bg-card")}><p className={cn("font-display text-3xl", i === 0 && "text-sidebar-primary")}>{n}</p><p className="font-mono text-[10px] uppercase tracking-wider opacity-70">{l}</p></div>
          ))}
        </div>
        <div className="grid max-w-xl gap-3 text-xs font-semibold sm:grid-cols-2">
          <label>Lab listing<select data-testid="select-inbox-project" className={sel} value={pf} onChange={(e) => setPf(e.target.value)}><option value="all">All listings</option>
            {(live
              ? [...new Map(all.map((r) => [r.projectId, r.projectTitle])).entries()]
              : projects.map((p) => [p.id, p.title] as [string, string])
            ).map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}</select></label>
          <label>Status<select data-testid="select-inbox-status" className={sel} value={sf} onChange={(e) => setSf(e.target.value as "all" | InterestStatus)}><option value="all">Any status</option>{(Object.keys(STATUS_LABEL) as InterestStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></label>
        </div>
        {list.length === 0 ? <EmptyState title="No requests here" body={live ? "No requests are recorded in this browser for your listings." : "When a student sends interest in one of your open projects, it appears in this inbox."} /> : (
          <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
            <ul className="space-y-2">
              {list.map((r) => {
                const proj = projects.find((p) => p.id === r.projectId);
                return (
                  <li key={r.id}>
                    <button data-testid={`row-request-${r.id}`} onClick={() => {
                        setOpenId(r.id);
                        // Below lg the detail panel sits under the list; bring it into view.
                        if (window.matchMedia("(max-width: 1023px)").matches)
                          requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
                      }} aria-pressed={openId === r.id}
                      className={cn("w-full border bg-card p-4 text-left transition-colors hover:border-primary/40", openId === r.id && "border-primary")}>
                      <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{r.studentName}</p>{r.compatibility !== undefined && <span data-testid={`text-compat-${r.id}`} title="Compatibility with this listing" className={cn("border px-1.5 py-0.5 font-mono text-[11px]", compatCls(r.compatibility))}>{r.compatibility}% match</span>}<span className="ml-auto bg-accent px-2 py-0.5 text-xs text-accent-foreground">{STATUS_LABEL[r.status]}</span></div>
                      <p className="mt-1 text-xs text-muted-foreground">{r.projectTitle} · {format(new Date(r.updatedAt), "MMM d, h:mm a")}</p>
                      <p className="mt-0.5 text-xs text-primary">{proj?.title}</p>
                      {r.message && <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground">{r.message}</p>}
                      <p className="mt-2 font-mono text-[10px] text-muted-foreground">{new Date(r.updatedAt).toLocaleDateString()}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
            <aside ref={detailRef} className="scroll-mt-4 border border-primary/20 bg-card p-5 lg:sticky lg:top-6">
              {cur ? (
                <div className="rise space-y-4" key={cur.id}>
                  <div>
                    <p className={lbl}>Set status</p>
                    <div className="flex flex-wrap gap-1.5">
                      {FAC_STAGES.map((s) => (
                        <button key={s} data-testid={`button-request-${s}-${cur.id}`} disabled={cur.status === "withdrawn"} onClick={async () => { if (live) { await liveStatus({ interestId: cur.id as never, status: s as never }); } else { setInterestStatus(cur.id, s); } toast({ title: `Marked ${STATUS_LABEL[s].toLowerCase()}` }); }}
                          className={cn("border px-3 py-1 text-xs transition-colors disabled:opacity-40", cur.status === s ? "border-primary bg-primary text-primary-foreground" : "border-primary/25 hover:bg-primary/5")}>{STATUS_LABEL[s]}</button>
                      ))}
                    </div>
                    {cur.status === "withdrawn" && <p className="mt-2 text-xs text-muted-foreground">The student withdrew this request.</p>}
                  </div>
                  <div><p className={lbl}>Request message</p><p className="max-h-56 overflow-y-auto whitespace-pre-line bg-secondary/60 p-3 text-xs">{cur.message || "No message."}</p></div>
                  {cur.demo
                    ? (() => {
                        const demoStudent =
                          demoStudents(DEMO_STUDENTS, profile).find(
                            (s) => s.id === cur.studentId,
                          ) ?? null;
                        return demoStudent ? (
                          <StudentDetailBody s={demoStudent} project={project} />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Student details are not available for this request.
                          </p>
                        );
                      })()
                    : (
                      <div className="space-y-3 text-sm" data-testid="text-live-student">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-2xl leading-tight">{cur.studentName}</p>
                            <p className="text-xs text-muted-foreground">
                              {[cur.studentMajor, cur.studentMinors?.length ? `minor in ${cur.studentMinors.join(", ")}` : null, cur.studentSchoolYear, cur.studentHoursPerWeek !== undefined ? `${cur.studentHoursPerWeek} h/wk` : null].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          {cur.compatibility !== undefined && <ScoreDial score={cur.compatibility} size={50} />}
                        </div>
                        {cur.studentBio && <p className="text-foreground/80">{cur.studentBio}</p>}
                        <div>
                          <p className={lbl}>Skills</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">{(cur.studentSkills ?? []).length ? (cur.studentSkills ?? []).map((k) => <span key={k} className="border border-primary/25 bg-primary/8 px-2 py-0.5 text-xs text-primary">{k}</span>) : <span className="text-xs text-muted-foreground">None listed.</span>}</div>
                        </div>
                        {(cur.studentInterests ?? []).length > 0 && <p className="text-xs"><span className="font-semibold">Interests:</span> {cur.studentInterests!.join(", ")}</p>}
                        {(cur.studentExperience ?? []).length > 0 && (
                          <div>
                            <p className={lbl}>Experience</p>
                            <ul className="mt-1.5 space-y-2">
                              {cur.studentExperience!.map((e, i) => (
                                <li key={i} className="text-xs">
                                  <p className="font-semibold">{e.role}{e.org ? ` · ${e.org}` : ""}</p>
                                  {e.description && <p className="text-muted-foreground">{e.description}</p>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {cur.studentSeekingCredit ? "Seeking academic credit" : "Not seeking credit"}{cur.studentWorkStudy ? " · Federal work-study" : ""}
                        </p>
                      </div>
                    )}
                </div>
              ) : <p className="py-10 text-center text-sm text-muted-foreground">Select a request to see the message and student details.</p>}
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
