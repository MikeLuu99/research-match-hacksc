// OpenAI embeddings client for Convex actions. The vector index is 1536
// dimensions, matching text-embedding-3-small.
const MODEL = "text-embedding-3-small";
const DIMENSIONS = 1536;
export const EMBEDDING_MODEL_ID = `openai/${MODEL}`;

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.EMBEDDING_API_KEY;
  if (!apiKey)
    throw new Error(
      "Embedding provider is not configured (missing EMBEDDING_API_KEY).",
    );
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, input: texts }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Embedding request failed (${response.status}): ${detail.slice(0, 300)}`,
    );
  }
  const payload = (await response.json()) as {
    data?: { embedding: number[] }[];
  };
  const embeddings = (payload.data ?? []).map((item) => item.embedding);
  if (embeddings.length !== texts.length)
    throw new Error(
      `Embedding response mismatch: expected ${texts.length}, got ${embeddings.length}.`,
    );
  for (const embedding of embeddings) {
    if (
      embedding.length !== DIMENSIONS ||
      embedding.some((value) => !Number.isFinite(value))
    )
      throw new Error(
        `Expected ${DIMENSIONS} finite embedding dimensions from ${MODEL}.`,
      );
  }
  return embeddings;
}

// Deterministic profile text so a re-embed of an unchanged profile is stable.
export function studentEmbeddingText(input: {
  name: string;
  major: string;
  minors: string[];
  schoolYear: string;
  skills: string[];
  interests: string[];
  experience: { role: string; org: string; description: string }[];
  workStudy: boolean;
  seekingCredit: boolean;
}): string {
  return [
    `Student: ${input.name}`,
    `Major: ${input.major}`,
    `Minors: ${(input.minors ?? []).join(", ")}`,
    `Year: ${input.schoolYear}`,
    `Skills: ${input.skills.join(", ")}`,
    `Research interests: ${input.interests.join(", ")}`,
    ...input.experience.map(
      (entry) =>
        `Experience: ${entry.role}${entry.org ? ` at ${entry.org}` : ""}${
          entry.description ? ` — ${entry.description}` : ""
        }`,
    ),
    input.workStudy ? "Federal Work-Study eligible" : "",
    input.seekingCredit ? "Seeking academic credit" : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function labEmbeddingText(input: {
  title: string;
  lab: string;
  department: string;
  description: string;
  faculty: string;
  requiredSkills: string[];
}): string {
  return [
    `Opportunity: ${input.title}`,
    `Lab: ${input.lab}`,
    `Department: ${input.department}`,
    `Faculty: ${input.faculty}`,
    `Description: ${input.description}`,
    `Required skills: ${input.requiredSkills.join(", ")}`,
  ].join("\n");
}
