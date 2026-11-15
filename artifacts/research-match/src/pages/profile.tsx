import { useRef, useState } from "react";
import { useQuery } from "convex/react";
import { LoaderCircle } from "lucide-react";
import { FileText, Lock, Eye, X, Plus } from "lucide-react";
import { Layout, PageHeader } from "@/components/layout";
import {
  StudentProfileForm,
  type StudentProfileInitial,
} from "@/components/student-profile-form";
import { api } from "@/lib/convex-api";
import { useAccount } from "@/lib/auth";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import { MAJORS } from "@/lib/data";

function TagEditor({ label, values, onChange, id }: { label: string; values: string[]; onChange: (v: string[]) => void; id: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div>
      <p className="text-sm font-semibold mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span key={v} className="group inline-flex items-center gap-1 rounded-full bg-primary/8 border border-primary/20 text-primary pl-3 pr-1 py-1 text-xs">
            {v}
            <button data-testid={`button-remove-${id}-${v}`} onClick={() => onChange(values.filter((x) => x !== v))} className="h-4 w-4 grid place-items-center rounded-full hover:bg-primary hover:text-primary-foreground transition"><X className="h-3 w-3" /></button>
          </span>
        ))}
        {!values.length && <span className="text-xs text-muted-foreground">None yet.</span>}
      </div>
      <div className="flex gap-2">
        <input data-testid={`input-${id}`} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder={`Add ${label.toLowerCase()}`} className="flex-1 h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary/50" />
        <button data-testid={`button-add-${id}`} onClick={add} className="h-10 px-3 rounded-lg border hover:bg-primary hover:text-primary-foreground hover:border-primary transition"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

// Signed-in students edit their real Convex profile here; saving also
// re-ingests the profile into embeddings. Visitors get the browser-local demo.
function RealProfileEditor() {
  const account = useAccount();
  const profile = useQuery(api.users.myStudentProfile, {});
  if (profile === undefined)
    return (
      <Layout>
        <div className="px-5 md:px-10 py-12 flex items-center gap-2 text-muted-foreground" role="status">
          <LoaderCircle className="animate-spin" size={16} /> Loading your
          profile…
        </div>
      </Layout>
    );
  const initial: StudentProfileInitial | undefined = profile
    ? {
        major: profile.major,
        minors: profile.minors ?? [],
        schoolYear: profile.schoolYear,
        skills: profile.skills,
        interests: profile.interests,
        experience: profile.experience,
        hoursPerWeek: profile.hoursPerWeek,
        workStudy: profile.workStudy,
        seekingCredit: profile.seekingCredit,
        recruitmentConsent: profile.recruitmentConsent,
        resumeFileName: profile.resumeFileName,
      }
    : undefined;
  return (
    <Layout>
      <PageHeader eyebrow="My profile" title={account.viewer?.name ?? "Your profile"}>
        Saved to your account — updating it also refreshes your embedding, so
        AI matches stay current.
      </PageHeader>
      <div className="px-5 md:px-10 pb-12 max-w-2xl">
        <div className="border border-primary/20 bg-card p-6">
          <StudentProfileForm initial={initial} variant="editor" />
        </div>
      </div>
    </Layout>
  );
}

export default function Profile() {
  const account = useAccount();
  if (
    account.isAuthenticated &&
    account.viewer?.accountType === "student" &&
    account.viewer.hasStudentProfile
  )
    return <RealProfileEditor />;
  return <DemoProfile />;
}

function DemoProfile() {
  const { profile, updateProfile } = useStore();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".txt")) {
      toast({ title: "Only .txt for now", description: "PDF parsing is deferred in this demo. Paste text instead.", variant: "destructive" });
      return;
    }
    const r = new FileReader();
    r.onload = () => { updateProfile({ resumeText: String(r.result ?? "").slice(0, 8000) }); toast({ title: "Resume text loaded", description: "Read locally. Nothing was uploaded." }); };
    r.readAsText(f);
  };

  return (
    <Layout>
      <PageHeader eyebrow="My profile · sample student" title={profile.name}>Sample profile for the demo. Changes save automatically to this browser and re-rank discovery.</PageHeader>
      <div className="px-5 md:px-10 pb-12 grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-6 grid md:grid-cols-2 gap-4">
            <label className="text-sm font-semibold">Name
              <input data-testid="input-name" value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} className="mt-1.5 w-full h-10 rounded-lg border bg-background px-3 font-normal" />
            </label>
            <label className="text-sm font-semibold">Major
              <select data-testid="select-major" value={profile.major} onChange={(e) => updateProfile({ major: e.target.value })} className="mt-1.5 w-full h-10 rounded-lg border bg-background px-3 font-normal">
                {MAJORS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">Year
              <select data-testid="select-year" value={profile.year} onChange={(e) => updateProfile({ year: e.target.value })} className="mt-1.5 w-full h-10 rounded-lg border bg-background px-3 font-normal">
                {["Freshman", "Sophomore", "Junior", "Senior", "Graduate"].map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">Availability: <span className="font-mono text-primary">{profile.hours} h/week</span>
              <input data-testid="input-hours" type="range" min={2} max={20} value={profile.hours} onChange={(e) => updateProfile({ hours: Number(e.target.value) })} className="mt-3 w-full accent-[hsl(var(--primary))]" />
            </label>
            <label className="md:col-span-2 text-sm font-semibold">Short bio
              <Textarea data-testid="input-bio" value={profile.bio} onChange={(e) => updateProfile({ bio: e.target.value })} rows={2} className="mt-1.5 font-normal bg-background" />
            </label>
          </section>
          <section className="rounded-2xl border bg-card p-6 grid md:grid-cols-2 gap-6">
            <TagEditor id="skill" label="Skills" values={profile.skills} onChange={(skills) => updateProfile({ skills })} />
            <TagEditor id="interest" label="Interests" values={profile.interests} onChange={(interests) => updateProfile({ interests })} />
          </section>
          <section className="rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">Resume text</p>
              <button data-testid="button-load-resume" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs hover:border-primary hover:text-primary transition"><FileText className="h-3.5 w-3.5" />Load .txt file</button>
              <input ref={fileRef} type="file" accept=".txt,text/plain" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Read locally in your browser; nothing is uploaded. PDF parsing is deferred for this demo. Resume text contributes lightly to the text vector.</p>
            <Textarea data-testid="input-resume" value={profile.resumeText} onChange={(e) => updateProfile({ resumeText: e.target.value })} rows={6} placeholder="Paste resume text or load a .txt file" className="mt-3 font-mono text-xs bg-background" />
          </section>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">Preferences</p>
            <div className="flex items-center justify-between gap-3"><span className="text-sm">Seeking academic credit</span><Switch data-testid="switch-credit" checked={profile.wantsCredit} onCheckedChange={(v) => updateProfile({ wantsCredit: v })} /></div>
            <div className="flex items-center justify-between gap-3"><span className="text-sm">Prefer paid positions</span><Switch data-testid="switch-paid" checked={profile.wantsPaid} onCheckedChange={(v) => updateProfile({ wantsPaid: v })} /></div>
          </div>
          <div className={`rounded-2xl border p-5 transition-colors ${profile.visible ? "bg-chart-3/10 border-chart-3/30" : "bg-sidebar text-sidebar-foreground"}`}>
            <div className="flex items-center gap-2">
              {profile.visible ? <Eye className="h-4 w-4 text-chart-3" /> : <Lock className="h-4 w-4 text-sidebar-primary" />}
              <p className="font-display text-lg">{profile.visible ? "Visible to faculty" : "Private by default"}</p>
            </div>
            <p className={`text-xs mt-2 ${profile.visible ? "text-muted-foreground" : "text-sidebar-foreground/70"}`}>
              {profile.visible ? "Your skills and interests appear in faculty candidate recommendations. Resume text is never shown." : "Faculty cannot see you in recommendations unless you opt in. Interest you send directly is still shared with that lab."}
            </p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium">Opt in to discovery</span>
              <Switch data-testid="switch-visible" checked={profile.visible} onCheckedChange={(v) => updateProfile({ visible: v })} />
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
