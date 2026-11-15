import { useMemo } from "react";
import { useQuery } from "@/lib/backend";
import { USC_PROJECTS } from "./usc-projects";
import { api } from "./convex-api";
import type { Project } from "./data";

// The student-facing lab catalog: the static USC dataset plus every
// faculty-created listing published to the platform (deduped by id).
export function useCatalogProjects(): Project[] {
  const published = useQuery(api.faculty.publishedProjects, {});
  return useMemo(
    () => [
      ...USC_PROJECTS,
      ...((published ?? []) as unknown as Project[]).filter(
        (p) => !USC_PROJECTS.some((u) => u.id === p.id),
      ),
    ],
    [published],
  );
}
