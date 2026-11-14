import { useState } from "react";
import { Link } from "wouter";
import { Layout, PageHeader, EmptyState } from "@/components/layout";
import { ProjectCard } from "@/components/bits";
import { ProjectDialog } from "@/components/project-dialog";
import { useStore } from "@/lib/store";
import { matchProject } from "@/lib/matching";
import type { Project } from "@/lib/data";

export default function Saved() {
  const { projects, saved, profile } = useStore();
  const [open, setOpen] = useState<Project | null>(null);
  const list = projects.filter((p) => saved.includes(p.id)).map((p) => ({ p, m: matchProject(profile, p) }));
  return (
    <Layout>
      <PageHeader eyebrow="Saved" title="Your shortlist">Labs you bookmarked. Closed listings stay here so you can check back next term.</PageHeader>
      <div className="px-5 md:px-10 pb-12">
        {list.length ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {list.map(({ p, m }, i) => <ProjectCard key={p.id} p={p} m={m} i={i} onOpen={() => setOpen(p)} />)}
          </div>
        ) : (
          <EmptyState title="Nothing saved yet" body="Tap the bookmark on any project to keep it here." action={<Link href="/" data-testid="link-browse" className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm inline-block hover:opacity-90">Browse labs</Link>} />
        )}
      </div>
      <ProjectDialog project={open} onClose={() => setOpen(null)} />
    </Layout>
  );
}
