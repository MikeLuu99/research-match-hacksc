// Generates src/lib/usc-projects.ts from public/data/usc-research.json.
// Run: node scripts/generate-usc-projects.mjs (from artifacts/research-match)
import { readFileSync, writeFileSync } from "node:fs";

const raw = JSON.parse(
  readFileSync(new URL("../public/data/usc-research.json", import.meta.url)),
);

const orgById = new Map(raw.organizations.map((org) => [org.id, org]));

const STATUS_MAP = {
  page_says_recruiting: "open",
  inquiry_invited: "open",
  recurring_application_schedule: "open",
  dated_notice_reconfirm: "exploration",
  historical_listing_reconfirm: "exploration",
  discovery_only: "exploration",
  participation_route_described: "exploration",
  program_route_unverified: "exploration",
  tentative_future_opening: "exploration",
  cyclical_no_specific_opening: "exploration",
  closed_upcoming_cycle: "closed",
  page_says_closed: "closed",
  past_cycle_reconfirm: "closed",
};

function levelFor(studentLevels) {
  const levels = new Set(studentLevels);
  if (levels.has("undergraduate")) return "beginner";
  if (levels.has("masters") || levels.has("graduate_unspecified"))
    return "intermediate";
  if (levels.has("phd")) return "advanced";
  return "beginner";
}

function hours(role) {
  const min = typeof role.hours_per_week_min === "number" ? role.hours_per_week_min : 5;
  const max = typeof role.hours_per_week_max === "number" ? role.hours_per_week_max : 10;
  return [Math.min(min, max), Math.max(min, max)];
}

function compensationFlags(compensation) {
  const text = (compensation ?? "").toLowerCase();
  return {
    paid: /pay|paid|hour|\$|stipend|salary/.test(text),
    credit: /credit/.test(text),
  };
}

function cleanSkills(items) {
  // Dataset skill requirements are prose sentences; keep them short for chips.
  return (items ?? [])
    .flatMap((item) =>
      String(item)
        .split(/[;,/]|\band\b/gi)
        .map((part) => part.trim()),
    )
    .filter((part) => part.length > 0 && part.length <= 42)
    .slice(0, 8);
}

const projects = [];
const seen = new Set();

for (const role of raw.student_roles_and_discovery_records) {
  const org = orgById.get(role.organization_id);
  if (!org || seen.has(role.id)) continue;
  seen.add(role.id);
  const [minHours, maxHours] = hours(role);
  const { paid, credit } = compensationFlags(role.compensation);
  const summary =
    org.student_friendly_description?.trim() ||
    org.research_summary?.trim() ||
    org.name;
  const statusNote = role.status_note
    ? ` Recruitment status from a public source, not confirmed by the lab: ${role.status_note}`
    : "";
    const topics = (org.topics ?? []).slice(0, 6);
    // Prose skill requirements make poor chips; fall back to lab topics when
    // the cleaned requirement text is sentence-like.
    const proseSkills = cleanSkills(role.required_skills_or_training);
    const requiredSkills =
      proseSkills.length >= 2 && proseSkills.every((s) => s.length <= 24)
        ? proseSkills
        : topics.length
          ? topics
          : proseSkills;
    projects.push({
    id: role.id,
    title: role.title,
    lab: org.name,
    pi: org.professors?.length ? org.professors.join(", ") : "Faculty (see lab page)",
    department: org.unit || org.affiliation || "USC",
    summary,
    description:
      `${org.research_summary ?? ""}${statusNote}`.trim() ||
      role.title,
    requiredSkills,
    niceSkills: cleanSkills(role.preferred_skills).slice(0, 6),
    minHours,
    maxHours,
    paid,
    credit,
    status: STATUS_MAP[role.status] ?? "exploration",
    level: levelFor(role.student_levels),
    eligibleMajors:
      role.required_majors_or_departments?.length
        ? role.required_majors_or_departments.slice(0, 6)
        : ["Any"],
    keywords: [...(org.topics ?? []), ...(org.research_methods ?? [])]
      .filter(Boolean)
      .slice(0, 12),
  });
}

projects.sort((a, b) => a.id.localeCompare(b.id));

const header = `// Generated from public/data/usc-research.json by scripts/generate-usc-projects.mjs.
// Source: audited USC research-discovery dataset (checked ${raw.source_checked_date}).
// Statuses come from public pages, not lab-confirmed vacancy checks; each
// description carries the dataset's verification caveat.
import type { Project } from "./data";

const USC_DATA_CHECKED = ${JSON.stringify(raw.source_checked_date)};
const USC_ORG_COUNT = ${raw.organizations.length};

export const USC_PROJECTS: Project[] = ${JSON.stringify(projects, null, 2)};
`;

writeFileSync(
  new URL("../src/lib/usc-projects.ts", import.meta.url),
  header,
);
console.log(`Generated ${projects.length} projects from ${raw.organizations.length} orgs`);
