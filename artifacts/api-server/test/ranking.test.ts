// @vitest-environment node
import { describe, expect, it } from "vitest";
import { bm25Scores, hybridRank, tokenize } from "../convex/ranking";

// Guards the unified compatibility percentage: full-corpus scoring must
// produce a hybrid score for every project in the catalog (Saved, catalog
// cards and project details reuse the AI recommendation formula), and the
// score must stay the same 65/35 blend the recommendation rows use.
describe("hybridRank candidate coverage", () => {
  const docs = Array.from({ length: 30 }, (_, i) => ({
    id: `doc-${i}`,
    text: i === 0 ? "machine learning healthcare diagnostics" : `unrelated topic ${i} ceramics geology`,
  }));
  const bm25 = bm25Scores(tokenize("machine learning healthcare diagnostics"), docs);
  const vectorHits = docs.map((doc, i) => ({ id: doc.id, similarity: 0.9 - i * 0.02 }));

  it("full-corpus candidateLimit scores every project, best match first", () => {
    const ranked = hybridRank(vectorHits, bm25, 128, 128);
    expect(ranked).toHaveLength(30);
    expect(ranked[0].id).toBe("doc-0");
    const scores = ranked.map((entry) => entry.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it("keeps the 65% vector + 35% BM25 blend for a scored project", () => {
    const ranked = hybridRank(vectorHits, bm25, 128, 128);
    const top = ranked.find((entry) => entry.id === "doc-0");
    expect(top).toBeDefined();
    const similarity = 0.9;
    const lexical = bm25.get("doc-0") ?? 0;
    expect(lexical).toBeGreaterThan(0);
    expect(top!.score).toBeCloseTo(0.65 * similarity + 0.35 * lexical, 10);
    expect(top!.similarity).toBeCloseTo(similarity, 10);
  });

  it("default candidateLimit keeps the top-24 discovery behavior", () => {
    const ranked = hybridRank(vectorHits, bm25, 5);
    expect(ranked).toHaveLength(5);
    expect(ranked[0].id).toBe("doc-0");
  });

  it("BM25 normalizes against the strongest lexical match in the corpus", () => {
    expect(bm25.get("doc-0")).toBe(1);
    expect((bm25.get("doc-1") ?? 0) >= 0).toBe(true);
  });
});
