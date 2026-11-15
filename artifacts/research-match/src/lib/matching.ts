import type { Project, StudentProfile } from "./data";

// Demo matching: local bag-of-words text vectors + cosine similarity,
// combined with explicit eligibility, skills, hours and credit checks.
// This is NOT a live AI embedding model.

const STOP = new Set("a an the and or of to in for with on at by from is are be as we our this that it into can how who".split(" "));

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function vec(parts: [string, number][]): Map<string, number> {
  const m = new Map<string, number>();
  for (const [text, w] of parts) for (const t of tokenize(text)) m.set(t, (m.get(t) ?? 0) + w);
  return m;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, na = 0, nb = 0;
  a.forEach((v, k) => { na += v * v; const o = b.get(k); if (o) dot += v * o; });
  b.forEach((v) => { nb += v * v; });
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

const norm = (s: string) => s.trim().toLowerCase();

export interface MatchResult {
  score: number; // 0..100
  textSimilarity: number; // raw cosine 0..1
  matchedSkills: string[];
  gaps: string[];
  niceMatched: string[];
  hoursFit: "fits" | "under" | "over";
  creditFit: boolean | null;
  paidFit: boolean | null;
  eligible: boolean;
  canApply: boolean;
  learningPotential: boolean;
  strengths: string[];
  notes: string[];
}

export function matchProject(s: StudentProfile, p: Project): MatchResult {
  const sv = vec([
    [s.skills.join(" "), 2],
    [s.interests.join(" "), 2],
    [s.major, 1],
    [s.bio, 0.5],
    [s.resumeText, 0.5],
  ]);
  const pv = vec([
    [p.requiredSkills.join(" "), 2],
    [p.niceSkills.join(" "), 1],
    [p.keywords.join(" "), 2],
    [p.title + " " + p.summary, 1],
    [p.description, 0.4],
  ]);
  const textSimilarity = cosine(sv, pv);
  const have = new Set(s.skills.map(norm));
  const matchedSkills = p.requiredSkills.filter((k) => have.has(norm(k)));
  const gaps = p.requiredSkills.filter((k) => !have.has(norm(k)));
  const niceMatched = p.niceSkills.filter((k) => have.has(norm(k)));
  const skillCov = p.requiredSkills.length ? matchedSkills.length / p.requiredSkills.length : 1;
  const hoursFit: MatchResult["hoursFit"] = s.hours < p.minHours ? "under" : "fits";
  const hoursScore = hoursFit === "fits" ? 1 : Math.max(0, 1 - (p.minHours - s.hours) / p.minHours);
  const creditFit = s.wantsCredit ? p.credit : null;
  const paidFit = s.wantsPaid ? p.paid : null;
  const prefScore = [creditFit, paidFit].filter((x) => x !== null) as boolean[];
  const pref = prefScore.length ? prefScore.filter(Boolean).length / prefScore.length : 1;
  const majorFit = p.eligibleMajors.includes("Any") || p.eligibleMajors.some((m) => norm(m) === norm(s.major));
  const eligible = majorFit && gaps.length === 0 && hoursFit !== "under" && creditFit !== false;
  const learningPotential = p.level === "beginner" && gaps.length > 0;
  // beginner projects soften skill gaps: they expect you to learn
  const skillTerm = p.level === "beginner" ? 0.5 + skillCov * 0.5 : skillCov;
  const textTerm = Math.min(1, textSimilarity * 2.2);
  let score = 0.4 * textTerm + 0.35 * skillTerm + 0.15 * hoursScore + 0.1 * pref;
  if (!majorFit) score *= 0.5;
  const strengths: string[] = [];
  if (matchedSkills.length) strengths.push(`You already list ${matchedSkills.join(", ")}.`);
  if (niceMatched.length) strengths.push(`Bonus skills: ${niceMatched.join(", ")}.`);
  const sharedInterests = s.interests.filter((i) => tokenize(i).some((t) => pv.has(t)));
  if (sharedInterests.length) strengths.push(`Your interest in ${sharedInterests.join(", ")} overlaps the lab's focus.`);
  if (hoursFit === "fits") strengths.push(`Your ${s.hours} h/week availability meets the ${p.minHours} h minimum.`);
  const notes: string[] = [];
  if (!majorFit) notes.push(`Listed for ${p.eligibleMajors.join(", ")} majors; ask the PI about exceptions.`);
  if (learningPotential) notes.push("Beginner-friendly mentoring may help close gaps; listed required skills still need confirmation.");
  if (hoursFit === "under") notes.push(`Needs at least ${p.minHours} h/week; you have ${s.hours}.`);
  if (creditFit === false) notes.push("You want academic credit; this listing does not offer it.");
  if (paidFit === false) notes.push("You prefer paid roles; this one is unpaid.");
  return {
    score: Math.round(score * 1000) / 10,
    textSimilarity,
    matchedSkills,
    gaps,
    niceMatched,
    hoursFit,
    creditFit,
    paidFit,
    eligible,
    canApply: p.status === "open",
    learningPotential,
    strengths,
    notes,
  };
}

export function defaultTemplate(s: StudentProfile, p: Project, m: MatchResult): string {
  const verb = p.status === "exploration" ? "learn more about the lab and possibly sit in on a meeting" : "be considered for an open research position";
  return `Dear ${p.pi.replace(" (fictional)", "")},

My name is ${s.name}, a ${s.year.toLowerCase()} in ${s.major}. I read about "${p.title}" and would love to ${verb}.

${m.matchedSkills.length ? `I have experience with ${m.matchedSkills.join(", ")}` : "I am eager to build the skills this project needs"}${m.gaps.length ? `, and I am actively working on ${m.gaps.join(", ")}` : ""}. I can commit about ${s.hours} hours per week${s.wantsCredit && p.credit ? " and am interested in doing this for academic credit" : ""}.

Would you have 15 minutes to talk in the coming weeks?

Thank you,
${s.name}`;
}
