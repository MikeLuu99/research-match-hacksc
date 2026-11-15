import { afterEach, describe, expect, it, vi } from "vitest";
import { makeFunctionReference } from "convex/server";
import { makeTest, signIn } from "../test/helpers";
import { api } from "./_generated/api";
import { answer } from "./chat";
import { embedStudent } from "./users";
import { embedProject } from "./faculty";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("scheduled AI actions", () => {
  it("keeps account-selecting background jobs out of the public API", () => {
    for (const job of [answer, embedStudent, embedProject]) {
      expect(job).toHaveProperty("isInternal", true);
      expect(job).not.toHaveProperty("isPublic", true);
    }
  });

  it("resolves the project lookup and persists a generated embedding", async () => {
    const { t } = makeTest();
    const projectId = await t.run((ctx) =>
      ctx.db.insert("projects", {
        sourceId: "background-test",
        title: "Research",
        department: "CS",
        description: "Research project",
        faculty: "Faculty",
        requiredSkills: [],
        preferredSkills: [],
        hoursPerWeek: 5,
        offersCredit: false,
        beginnerFriendly: true,
        recruitmentStatus: "open",
        embeddingModel: "",
        embedding: [],
        ownerId: "project-owner",
      }),
    );
    const vector = Array.from({ length: 1536 }, (_, i) => (i === 0 ? 1 : 0));
    vi.stubEnv("EMBEDDING_API_KEY", "test-placeholder");
    const provider = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ data: [{ embedding: vector }] }), {
          status: 200,
        }),
      );
    vi.stubGlobal("fetch", provider);

    await t.action(makeFunctionReference<"action">("faculty:embedProject"), {
      projectId,
    });

    expect(provider).toHaveBeenCalledOnce();
    const project = await t.run((ctx) => ctx.db.get(projectId));
    expect(project?.embedding).toEqual(vector);
    expect(project?.embeddingModel).toBe("openai/text-embedding-3-small");
  });

  it("still runs chat responses scheduled by an authenticated sender", async () => {
    vi.useFakeTimers();
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const test = makeTest();
    const me = await signIn(test, "student@usc.edu");
    await me.mutation(api.chat.send, {
      question: "Which labs match my interests?",
    });
    await test.t.finishAllScheduledFunctions(() => {
      vi.runAllTimers();
    });
    const messages = await me.query(api.chat.myMessages, {});
    expect(messages.filter((message) => message.isViewer)).toHaveLength(1);
    expect(messages.filter((message) => !message.isViewer)).toHaveLength(1);
    expect(new Set(messages.map((message) => message.ownerSubject)).size).toBe(
      1,
    );
  });
});
