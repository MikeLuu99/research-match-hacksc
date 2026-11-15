import { describe, expect, it } from "vitest";
import { compatibilityScore } from "./compatibility";

const project = {
  title: "Clinical machine learning",
  description: "Build models that predict patient outcomes from health records.",
  requiredSkills: ["Python", "Statistics"],
  preferredSkills: ["PyTorch"],
  hoursPerWeek: 10,
  offersCredit: true,
  beginnerFriendly: false,
  embedding: [],
  embeddingModel: "none",
};

const strong = {
  skills: ["python", "Statistics", "PyTorch"],
  interests: ["machine learning", "health"],
  hoursPerWeek: 12,
  seekingCredit: true,
};

describe("compatibilityScore", () => {
  it("returns a whole percentage between 0 and 100", () => {
    const score = compatibilityScore(strong, project);
    expect(Number.isInteger(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("ranks a matching student above an unrelated one", () => {
    const weak = {
      skills: ["Watercolor"],
      interests: ["poetry"],
      hoursPerWeek: 3,
      seekingCredit: true,
    };
    expect(compatibilityScore(strong, project)).toBeGreaterThan(
      compatibilityScore(weak, project),
    );
    expect(compatibilityScore(strong, project)).toBeGreaterThanOrEqual(80);
  });

  it("penalizes a credit mismatch", () => {
    const noCredit = { ...project, offersCredit: false };
    expect(compatibilityScore(strong, noCredit)).toBeLessThan(
      compatibilityScore(strong, project),
    );
  });

  it("uses embeddings when both sides share a model", () => {
    const embedded = { ...project, embedding: [1, 0], embeddingModel: "m" };
    const aligned = { ...strong, embedding: [1, 0], embeddingModel: "m" };
    const opposite = { ...strong, embedding: [0, 1], embeddingModel: "m" };
    expect(compatibilityScore(aligned, embedded)).toBeGreaterThan(
      compatibilityScore(opposite, embedded),
    );
  });
});
