import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { makeFunctionReference } from "convex/server";
import { makeTest, signIn, type TestContext } from "../test/helpers";
import { LABS } from "./labData";
import { api } from "./_generated/api";

// End-to-end algorithm check for the hybrid AI matching pipeline, with
// embeddings injected directly so vector-search behavior is deterministic
// (no network): the student's vector is a unit vector aligned with one lab.
// The scheduled embedStudent runs against a stubbed OpenAI endpoint, and is
// flushed after each save so injections stay authoritative.
const stubEmbedding = { data: [{ embedding: new Array(1536).fill(0.01) }] };

beforeAll(() => {
  vi.stubEnv("EMBEDDING_API_KEY", "test-key");
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(stubEmbedding), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
});

afterAll(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

async function flushScheduled(test: TestContext) {
  await test.t.finishAllScheduledFunctions(() => {});
}

async function seedWorld() {
  const test = makeTest();
  const prof = await signIn(test, "prof@usc.edu");
  await prof.mutation(api.users.completeProfile, {
    name: "Professor",
    accountType: "faculty",
  });
  await prof.mutation(api.projects.seedLabs, {});

  const student = await signIn(test, "student@usc.edu");
  await student.mutation(api.users.completeProfile, {
    name: "Student",
    accountType: "student",
  });
  await student.mutation(api.users.upsertStudentProfile, {
    major: "Computer Science",
    schoolYear: "junior",
    minors: [],
    skills: ["Python"],
    interests: ["machine learning"],
    experience: [],
    hoursPerWeek: 10,
    workStudy: false,
    seekingCredit: false,
    recruitmentConsent: true,
    resumeStorageId: undefined,
    resumeFileName: undefined,
  });
  await flushScheduled(test);
  const mine = (await student.query(api.users.myStudentProfile, {})) as {
    _id: string;
  };

  // One aligned lab (similarity 1), one orthogonal (~0), every other lab at
  // -1 so the ranking decision is unambiguous.
  const zero = new Array(1536).fill(0);
  const aligned = [1, ...zero.slice(1)];
  const orthogonal = [0, 1, ...zero.slice(2)];
  const opposite = [-1, ...zero.slice(1)];
  for (const [index, lab] of LABS.entries()) {
    const embedding =
      index === 0 ? aligned : index === 1 ? orthogonal : opposite;
    await test.t.mutation(
      makeFunctionReference<"mutation">("projects:storeProjectEmbedding"),
      { sourceId: lab.sourceId, embedding },
    );
  }
  await test.t.mutation(
    makeFunctionReference<"mutation">("users:storeStudentEmbedding"),
    { studentId: mine._id as never, embedding: aligned },
  );
  return { test, prof, student, mine, aligned };
}

describe("matching algorithm", () => {
  it("ranks the aligned lab first, descending, capped at 10", async () => {
    const { student } = await seedWorld();
    const result = (await student.action(api.discovery.myMatches, {})) as {
      ready: boolean;
      matches: { sourceId: string; similarity: number }[];
    };
    expect(result.ready).toBe(true);
    expect(result.matches.length).toBe(5);
    expect(result.matches[0].sourceId).toBe(LABS[0].sourceId);
    const scores = result.matches.map((match) => match.similarity);
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
    // The aligned lab's hybrid score dominates the orthogonal and opposite
    // labs, but the blend keeps keyword matches competitive (not all ~1).
    expect(result.matches.every((match) => match.similarity > 0.9)).toBe(
      false,
    );
  });

  it("returns the aligned student for faculty-side ranking", async () => {
    const { prof, mine } = await seedWorld();
    const catalog = (await prof.query(api.projects.listLabs, {})) as {
      id: string;
      sourceId: string;
    }[];
    const target = catalog.find((lab) => lab.sourceId === LABS[0].sourceId);
    const result = (await prof.action(api.discovery.labCandidates, {
      labId: target!.id as never,
    })) as {
      ready: boolean;
      matches: { studentId: string; similarity: number }[];
    };
    expect(result.ready).toBe(true);
    expect(result.matches.length).toBe(1);
    expect(result.matches[0].studentId).toBe(mine._id);
    expect(result.matches[0].similarity).toBeGreaterThan(0.9);
  });

  it("caps candidates at 10 per lab", async () => {
    const { test, prof } = await seedWorld();
    // Twelve consented students with aligned embeddings: the ranking must
    // return exactly 10.
    const zero = new Array(1536).fill(0);
    const aligned = [1, ...zero.slice(1)];
    for (let i = 0; i < 12; i += 1) {
      const extra = await signIn(test, `student${i}@usc.edu`);
      await extra.mutation(api.users.completeProfile, {
        name: `Student ${i}`,
        accountType: "student",
      });
      await extra.mutation(api.users.upsertStudentProfile, {
        major: "Computer Science",
        schoolYear: "junior",
        minors: [],
    skills: ["Python"],
        interests: ["machine learning"],
        experience: [],
        hoursPerWeek: 10,
        workStudy: false,
        seekingCredit: false,
        recruitmentConsent: true,
        resumeStorageId: undefined,
        resumeFileName: undefined,
      });
      await flushScheduled(test);
      const mine = (await extra.query(api.users.myStudentProfile, {})) as {
        _id: string;
      };
      await test.t.mutation(
        makeFunctionReference<"mutation">("users:storeStudentEmbedding"),
        { studentId: mine._id as never, embedding: aligned },
      );
    }
    void prof;
    const catalog = (await prof.query(api.projects.listLabs, {})) as {
      id: string;
      sourceId: string;
    }[];
    const target = catalog.find((lab) => lab.sourceId === LABS[0].sourceId);
    const result = (await prof.action(api.discovery.labCandidates, {
      labId: target!.id as never,
    })) as { ready: boolean; matches: unknown[] };
    expect(result.ready).toBe(true);
    expect(result.matches.length).toBe(5);
  });
});
