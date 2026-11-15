import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Layout, PageHeader } from "@/components/layout";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useStore, type FacultyProfile as FP } from "@/lib/store";
import { useFacultyMode } from "@/lib/faculty-mode";
import { DEPARTMENTS } from "@/lib/data";
import { LocalNotice } from "@/components/faculty/demo-notice";

const input = "mt-1.5 h-10 w-full border border-primary/25 bg-background px-3 text-sm font-normal";
const TITLES = ["Assistant Professor", "Associate Professor", "Professor", "Research Scientist", "Lecturer"];

export default function FacultyProfile() {
  const live = useFacultyMode() === "live";
  const { faculty, updateFaculty } = useStore();
  const [draft, setDraft] = useState("");
  const set = (k: keyof FP) => (e: { target: { value: string } }) => updateFaculty({ [k]: e.target.value } as Partial<FP>);
  const add = () => { const v = draft.trim(); if (v && !faculty.researchAreas.some((x) => x.toLowerCase() === v.toLowerCase())) updateFaculty({ researchAreas: [...faculty.researchAreas, v] }); setDraft(""); };
  const depts = Array.from(new Set([...(faculty.department ? [faculty.department] : [""]), ...DEPARTMENTS]));

  return (
    <Layout>
      <PageHeader eyebrow={live ? "Faculty profile · browser-local" : "Faculty profile · sample"} title={faculty.name || "Unnamed faculty"}>
        Saved automatically to this browser, separately from any student profile.
      </PageHeader>
      <div className="grid gap-6 px-5 pb-12 md:px-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="grid gap-4 border border-primary/20 bg-card p-6 text-sm font-semibold md:grid-cols-2">
            <h2 className="font-display text-xl font-normal md:col-span-2">Appointment</h2>
            <label>Display name<input data-testid="input-fac-name" className={input} value={faculty.name} onChange={set("name")} /></label>
            <label>Title<select data-testid="select-fac-title" className={input} value={faculty.title} onChange={set("title")}>{TITLES.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label>Department<select data-testid="select-fac-dept" className={input} value={faculty.department} onChange={set("department")}>{depts.map((d) => <option key={d || "none"} value={d}>{d || "Choose a department"}</option>)}</select></label>
            <label>Lab or group<input data-testid="input-fac-lab" className={input} value={faculty.lab} onChange={set("lab")} /></label>
            <label>Contact email<input data-testid="input-fac-email" type="email" placeholder="name@usc.edu" className={input} value={faculty.email} onChange={set("email")} /></label>
            <label>Office<input data-testid="input-fac-office" placeholder="Building and room" className={input} value={faculty.office} onChange={set("office")} /></label>
            <label className="md:col-span-2">Office hours for prospective students<input data-testid="input-fac-hours" placeholder="e.g. Tuesdays 2-3pm" className={input} value={faculty.officeHours} onChange={set("officeHours")} /></label>
          </section>
          <section className="space-y-4 border border-primary/20 bg-card p-6 text-sm font-semibold">
            <h2 className="font-display text-xl font-normal">Research and mentoring</h2>
            <div>
              <p>Research areas</p>
              <div className="my-2 flex flex-wrap gap-1.5">
                {faculty.researchAreas.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 border border-primary/25 bg-primary/8 py-1 pl-3 pr-1 text-xs font-normal text-primary">{a}
                    <button aria-label={`Remove ${a}`} data-testid={`button-remove-area-${a}`} onClick={() => updateFaculty({ researchAreas: faculty.researchAreas.filter((x) => x !== a) })} className="grid h-4 w-4 place-items-center hover:bg-primary hover:text-primary-foreground"><X className="h-3 w-3" /></button>
                  </span>
                ))}
                {!faculty.researchAreas.length && <span className="text-xs font-normal text-muted-foreground">None yet.</span>}
              </div>
              <div className="flex gap-2">
                <input aria-label="Add a research area" data-testid="input-area" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder="Add a research area" className="h-10 flex-1 border border-primary/25 bg-background px-3 text-sm font-normal" />
                <button aria-label="Add research area" data-testid="button-add-area" onClick={add} className="h-10 border border-primary/25 px-3 hover:bg-primary hover:text-primary-foreground"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <label className="block">About the lab<Textarea data-testid="input-fac-about" rows={3} className="mt-1.5 bg-background font-normal" value={faculty.about} onChange={set("about")} /></label>
            <label className="block">Mentoring style<Textarea data-testid="input-fac-mentoring" rows={3} placeholder="How you onboard and support undergraduates" className="mt-1.5 bg-background font-normal" value={faculty.mentoring} onChange={set("mentoring")} /></label>
          </section>
        </div>
        <aside className="space-y-4">
          <div className="border border-primary/20 bg-card p-5">
            <p className="font-display text-lg">Accepting students</p>
            <p className="mt-1 text-xs text-muted-foreground">A profile-level signal. Each project still controls its own recruiting status.</p>
            <div className="mt-4 flex items-center justify-between"><span className="text-sm">Open to new students</span><Switch data-testid="switch-accepting" checked={faculty.accepting} onCheckedChange={(v) => updateFaculty({ accepting: v })} /></div>
          </div>
          <LocalNotice>{live ? "Stored only in this browser for this account. It is not published to students or synced, and nothing is sent to the email above." : "Fictional sample profile stored only in this browser. It is not published and no email is sent to the address above."}</LocalNotice>
        </aside>
      </div>
    </Layout>
  );
}
