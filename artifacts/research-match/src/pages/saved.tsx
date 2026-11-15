import { useState } from "react";
import { Link } from "wouter";
import { Layout, PageHeader, EmptyState } from "@/components/layout";
import { ProjectGrid } from "@/components/bits";
import { useCatalogProjects } from "@/lib/use-catalog-projects";
import { useMatchProfile } from "@/lib/use-match-profile";
import { ProjectDialog } from "@/components/project-dialog";
import { useStore } from "@/lib/store";
import { matchProject } from "@/lib/matching";
import { useHybridScores, withHybridScore } from "@/lib/use-project-scores";
import type { Project } from "@/lib/data";

export default function Saved() {
  const { saved } = useStore();
  const profile = useMatchProfile();
  const catalog = useCatalogProjects();
  const scores = useHybridScores();
  const [open, setOpen] = useState<Project | null>(null);
  const list = catalog
    .filter((p) => saved.includes(p.sourceId ?? p.id))
    .map((p) => ({ p, m: withHybridScore(matchProject(profile, p), p.sourceId ?? p.id, scores) }));
  return (
    <Layout>
      <PageHeader eyebrow="Saved" title="Your shortlist">Labs you bookmarked. Closed listings stay here so you can check back next term.</PageHeader>
      <div className="px-5 md:px-10 pb-12">
        {list.length ? (
          <ProjectGrid list={list} onOpen={setOpen} className="md:grid-cols-2 xl:grid-cols-3" />
        ) : (
          <EmptyState title="Nothing saved yet" body="Tap the bookmark on any project to keep it here." action={<Link href="/" data-testid="link-browse" className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm inline-block hover:opacity-90">Browse labs</Link>} />
        )}
      </div>
      <ProjectDialog project={open} onClose={() => setOpen(null)} />
    </Layout>
  );
}
