// Lexical scoring (BM25) and hybrid fusion for AI matching. The corpus is
// small (82 labs), so BM25 is computed over candidate documents at query time
// instead of maintaining a lexical index.

const STOP_WORDS = new Set([
  "and",
  "are",
  "but",
  "for",
  "into",
  "not",
  "or",
  "the",
  "their",
  "them",
  "they",
  "this",
  "that",
  "with",
  "you",
  "your",
]);

const K1 = 1.5;
const B = 0.75;
// Weight blend: semantic similarity dominates, keyword precision breaks ties
// and rescues exact matches (course codes, lab names, skill names).
const VECTOR_WEIGHT = 0.65;
const BM25_WEIGHT = 0.35;

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#']+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

type Doc = { id: string; text: string };

// BM25 scores for every document against the query tokens, normalized to
// [0, 1] by the strongest lexical match in the set.
export function bm25Scores(queryTokens: string[], docs: Doc[]): Map<string, number> {
  const docTokens = docs.map((doc) => tokenize(doc.text));
  const avgLen =
    docTokens.reduce((total, tokens) => total + tokens.length, 0) /
    (docTokens.length || 1);
  const docFreq = new Map<string, number>();
  for (const tokens of docTokens) {
    for (const token of new Set(tokens)) {
      docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
    }
  }
  const total = docs.length || 1;
  const idf = new Map<string, number>();
  for (const token of new Set(queryTokens)) {
    const df = docFreq.get(token) ?? 0;
    idf.set(token, Math.log(1 + (total - df + 0.5) / (df + 0.5)));
  }
  const rawScores = docs.map((doc, index) => {
    const tokens = docTokens[index];
    const len = tokens.length || 1;
    const termFreq = new Map<string, number>();
    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) ?? 0) + 1);
    }
    let score = 0;
    for (const token of new Set(queryTokens)) {
      const tf = termFreq.get(token) ?? 0;
      if (tf === 0) continue;
      const weight = idf.get(token) ?? 0;
      score +=
        weight * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (len / avgLen))));
    }
    return { id: doc.id, score };
  });
  const max = Math.max(0, ...rawScores.map((entry) => entry.score));
  return new Map(
    rawScores.map((entry) => [
      entry.id,
      max > 0 ? entry.score / max : 0,
    ]),
  );
}

// Hybrid ranking: fuse vector similarity and BM25 with a weighted blend, over
// the union of each signal's top candidates. Returns ids with their hybrid
// score, sorted descending, capped at `limit`.
export function hybridRank(
  vectorHits: { id: string; similarity: number }[],
  bm25: Map<string, number>,
  limit: number,
): { id: string; score: number; similarity: number }[] {
  const lexicalHits = [...bm25.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24)
    .map(([id]) => id);
  const vectorById = new Map(
    vectorHits.map((hit) => [hit.id, hit.similarity]),
  );
  const candidates = new Set<string>([
    ...vectorHits.slice(0, 24).map((hit) => hit.id),
    ...lexicalHits,
  ]);
  const ranked = [...candidates]
    .map((id) => {
      const similarity = vectorById.get(id) ?? 0;
      const lexical = bm25.get(id) ?? 0;
      return {
        id,
        score: VECTOR_WEIGHT * similarity + BM25_WEIGHT * lexical,
        similarity,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return ranked;
}
