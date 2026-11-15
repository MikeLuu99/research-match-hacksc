import { useState } from "react";
import { Pencil, Plus, Trash2, ChevronDown } from "lucide-react";
import { Layout, PageHeader, EmptyState } from "@/components/layout";
import { RecruitPill } from "@/components/bits";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex-api";
import { useStore } from "@/lib/store";
import type { Project } from "@/lib/data";
import { useFacultyMode } from "@/lib/faculty-mode";
import { cn } from "@/lib/utils";
import { ProjectForm } from "@/components/faculty/project-form";
import { LocalNotice } from "@/components/faculty/demo-notice";

const chip = "border border-primary/25 bg-primary/8 px-2 py-0.5 text-primary";

function ProjectDetails({
  p,
  requests,
  onEdit,
  onDelete,
}: {
  p: Project;
  requests: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { shortlists } = useStore();
  return (
    <div id={`details-${p.id}`} data-testid={`panel-project-${p.id}`} className="rise space-y-4 border-t border-primary/15 px-4 py-5 md:px-5">
      <p className="text-sm text-foreground/80">{p.description}</p>
      <div className="grid gap-3 text-xs sm:grid-cols-2">
        <div><p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">Required skills</p><div className="flex flex-wrap gap-1.5">{p.requiredSkills.length ? p.requiredSkills.map((s) => <span key={s} className={chip}>{s}</span>) : <span className="text-muted-foreground">None</span>}</div></div>
        <div><p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">Nice to have</p><div className="flex flex-wrap gap-1.5">{p.niceSkills.length ? p.niceSkills.map((s) => <span key={s} className="border border-dashed border-primary/30 px-2 py-0.5">{s}</span>) : <span className="text-muted-foreground">None</span>}</div></div>
        <p><span className="font-semibold">Eligible majors:</span> {p.eligibleMajors.join(", ")}</p>
        <p><span className="font-semibold">Level:</span> {p.level} · {p.paid ? "paid" : "unpaid"} · {p.credit ? "credit" : "no credit"}</p>
        <p><span className="font-semibold">Keywords:</span> {p.keywords.join(", ") || "none"}</p>
        <p className="font-mono"><span className="font-sans font-semibold">Activity:</span> {requests} requests · {(shortlists[p.id] ?? []).length} shortlisted</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" data-testid={`button-edit-${p.id}`} onClick={onEdit}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>
        <Button variant="outline" size="sm" data-testid={`button-delete-${p.id}`} onClick={onDelete} className="hover:border-destructive/40 hover:text-destructive"><Trash2 className="mr-1 h-3.5 w-3.5" />Remove</Button>
      </div>
    </div>
  );
}

export default function Faculty() {
  const mode = useFacultyMode();
  const live = mode === "live";
  const { projects: demoProjects, interests, upsertProject, removeProject } = useStore();
  const liveProjects = useQuery(api.faculty.myProjects, live ? {} : "skip");
  const liveInbox = useQuery(api.interests.labInbox, live ? {} : "skip");
  const createProject = useMutation(api.faculty.createProject);
  const updateProject = useMutation(api.faculty.updateProject);
  const removeProjectMutation = useMutation(api.faculty.removeProject);
  const { toast } = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Project | null | "new">(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const projects: Project[] = live
    ? ((liveProjects ?? []) as unknown as Project[])
    : demoProjects;
  // Real request counts in live mode; local store counts in the demo.
  const requestCount = (projectId: string) =>
    live
      ? (liveInbox ?? []).filter(
          (row) => row.sourceId === projectId && row.status === "interested",
        ).length
      : interests.filter(
          (i) => i.projectId === projectId && i.status === "interested",
        ).length;

  async function saveProject(project: Project) {
    if (!live) {
      upsertProject(project);
      toast({ title: "Project saved in this browser" });
      setOpenId(project.id);
      setEditing(null);
      return;
    }
    const status: "open" | "closed" | "explore" =
      project.status === "exploration"
        ? "explore"
        : project.status === "closed"
          ? "closed"
          : "open";
    const args = {
      title: project.title,
      labName: project.lab,
      department: project.department,
      summary: project.summary,
      description: project.description,
      requiredSkills: project.requiredSkills,
      niceSkills: project.niceSkills,
      eligibleMajors: project.eligibleMajors,
      keywords: project.keywords,
      minHours: project.minHours,
      maxHours: project.maxHours,
      paid: project.paid,
      credit: project.credit,
      status,
      level: project.level,
    };
    try {
      if (editing === "new") {
        const created = (await createProject(args)) as { id: string };
        setOpenId(created.id);
      } else if (editing) {
        await updateProject({ projectId: editing.id as never, ...args });
        setOpenId(editing.id);
      }
      toast({ title: "Project saved — your embedding is regenerating" });
      setEditing(null);
    } catch {
      toast({ title: "Couldn't save the project", variant: "destructive" });
    }
  }

  async function deleteProject(project: Project) {
    if (!live) {
      removeProject(project.id);
      toast({ title: "Project removed" });
      setDeleting(null);
      setOpenId(null);
      return;
    }
    try {
      await removeProjectMutation({ projectId: project.id as never });
      toast({ title: "Project removed" });
    } catch {
      toast({ title: "Couldn't remove the project", variant: "destructive" });
    }
    setDeleting(null);
    setOpenId(null);
  }

  return (
    <Layout>
      <PageHeader eyebrow={mode === "live" ? "Lab workspace" : "Lab workspace · demo"} title="Your lab's listings">
        Create, edit and review your own project listings. Only you see and manage the projects you create.
      </PageHeader>
      <div className="max-w-4xl space-y-4 px-5 pb-12 md:px-10">
        {!live && (
          <LocalNotice>
            Local demo only. Listings live in this browser's storage; nothing is published, recruited for, or emailed.
          </LocalNotice>
        )}
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl">Projects <span className="font-mono text-xs text-muted-foreground">{projects.length}</span></h2>
          <Button data-testid="button-new-project" onClick={() => setEditing("new")}><Plus className="mr-1 h-4 w-4" />New project</Button>
        </div>
        {projects.length === 0 ? (
          <EmptyState title="No projects yet" body="Create your first listing to rank students and track interest." action={<Button onClick={() => setEditing("new")}>Create a project</Button>} />
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => {
              const open = openId === p.id;
              return (
                <li key={p.id} className={cn("overflow-hidden border bg-card transition-colors", open && "border-primary/50")}>
                  <button data-testid={`button-select-${p.id}`} aria-expanded={open} aria-controls={`details-${p.id}`} onClick={() => setOpenId(open ? null : p.id)}
                    className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:p-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><RecruitPill status={p.status} />{requestCount(p.sourceId ?? p.id) > 0 && <span className="bg-chart-2 px-1.5 font-mono text-[11px] text-accent-foreground">{requestCount(p.sourceId ?? p.id)} new</span>}</div>
                      <p className="mt-1.5 font-display text-lg leading-snug">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.lab} · {p.department} · {p.minHours}-{p.maxHours} h/wk</p>
                    </div>
                    <ChevronDown className={cn("mt-1 h-5 w-5 shrink-0 transition-transform duration-300", open && "rotate-180 text-primary")} />
                  </button>
                  {open && (
                    <ProjectDetails
                      p={p}
                      requests={requestCount(p.sourceId ?? p.id)}
                      onEdit={() => setEditing(p)}
                      onDelete={() => setDeleting(p)}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto">
          <DialogTitle className="font-display text-2xl">{editing === "new" ? "New project" : "Edit project"}</DialogTitle>
          <DialogDescription>Stored only in this browser.</DialogDescription>
          {editing !== null && (
            <ProjectForm initial={editing === "new" ? null : editing} onCancel={() => setEditing(null)}
              onSave={saveProject} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Remove this project?</AlertDialogTitle>
          <AlertDialogDescription>"{deleting?.title}" and its interest requests will be removed{live ? " from your account" : " from this browser"}.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction data-testid="button-confirm-delete" onClick={() => { if (deleting) void deleteProject(deleting); }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
