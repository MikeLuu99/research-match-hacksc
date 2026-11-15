import { useQuery } from "convex/react";
import { api } from "./convex-api";
import { useStore } from "./store";
import { useFacultyMode } from "./faculty-mode";
import type { Project } from "./data";

/**
 * The faculty member's own projects, in the same order as the lab workspace.
 * Signed-in faculty read their Convex listings; the demo uses the
 * browser-local sample projects. Undefined while live projects load.
 */
export function useFacultyProjects(): Project[] | undefined {
  const live = useFacultyMode() === "live";
  const { projects } = useStore();
  const liveProjects = useQuery(api.faculty.myProjects, live ? {} : "skip");
  if (!live) return projects;
  return liveProjects as unknown as Project[] | undefined;
}
