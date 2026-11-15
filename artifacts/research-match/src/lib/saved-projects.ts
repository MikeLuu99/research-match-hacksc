import type { Project } from "./data";

// AI/chat results identify projects by sourceId. Migrate older catalog
// bookmarks (Convex document IDs) to the same key as listings arrive.
export function normalizeSavedProjectIds(
  saved: readonly string[],
  projects: readonly Pick<Project, "id" | "sourceId">[],
): string[] {
  const sourceIds = new Map(projects.map((p) => [p.id, p.sourceId ?? p.id]));
  return [...new Set(saved.map((id) => sourceIds.get(id) ?? id))];
}
