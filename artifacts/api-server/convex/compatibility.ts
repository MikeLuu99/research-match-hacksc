// Student-to-project compatibility for the faculty interest inbox. Pure
// helpers only, so they can be unit tested without a Convex backend.

import { tokenize } from "./ranking";

type CompatStudent = {
  skills: string[];
  interests: string[];
  hoursPerWeek: number;
  seekingCredit: boolean;
  embedding?: number[];
  embeddingModel?: string;
};

type CompatProject = {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  hoursPerWeek: number;
  offersCredit: boolean;
  beginnerFriendly: boolean;
  embedding: number[];
  embeddingModel: string;
};

const norm = (s: string) => s.trim().toLowerCase();

function cosine(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/**
 * Compatibility as a whole percentage (0-100). Blends required/preferred
 * skill coverage, hours, credit preference and topical fit. Topical fit uses
 * embedding similarity when both sides were embedded with the same model,
 * otherwise interest keyword overlap with the project text.
 */
export function compatibilityScore(
  student: CompatStudent,
  project: CompatProject,
): number {
  const have = new Set(student.skills.map(norm));
  const required = project.requiredSkills;
  const preferred = project.preferredSkills;
  const requiredCov = required.length
    ? required.filter((k) => have.has(norm(k))).length / required.length
    : 1;
  // Beginner-friendly projects expect students to learn missing skills.
  const requiredTerm = project.beginnerFriendly
    ? 0.5 + requiredCov * 0.5
    : requiredCov;
  const preferredTerm = preferred.length
    ? preferred.filter((k) => have.has(norm(k))).length / preferred.length
    : 1;
  const hoursTerm =
    project.hoursPerWeek <= 0 || student.hoursPerWeek >= project.hoursPerWeek
      ? 1
      : Math.max(0, student.hoursPerWeek / project.hoursPerWeek);
  const creditTerm =
    student.seekingCredit && !project.offersCredit ? 0 : 1;

  let topicTerm: number;
  if (
    student.embedding?.length &&
    project.embedding.length &&
    student.embeddingModel === project.embeddingModel
  ) {
    topicTerm = Math.max(0, cosine(student.embedding, project.embedding));
  } else {
    const projectTokens = new Set(
      tokenize(
        [project.title, project.description, ...required, ...preferred].join(" "),
      ),
    );
    const interestTokens = [
      ...new Set(tokenize([...student.interests, ...student.skills].join(" "))),
    ];
    const hits = interestTokens.filter((t) => projectTokens.has(t)).length;
    topicTerm = interestTokens.length
      ? Math.min(1, (hits / interestTokens.length) * 2)
      : 0;
  }

  const score =
    0.4 * requiredTerm +
    0.15 * preferredTerm +
    0.25 * topicTerm +
    0.1 * hoursTerm +
    0.1 * creditTerm;
  return Math.round(Math.min(1, Math.max(0, score)) * 100);
}
