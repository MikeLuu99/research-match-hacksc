import { describe, expect, it } from "vitest";
import { makeTest, signIn } from "../test/helpers";
import { api } from "./_generated/api";

async function requestFixture(
  status: "interested" | "conversation" | "accepted" | "declined" | "withdrawn",
) {
  const test = makeTest();
  const me = await signIn(test, "student@usc.edu");
  const viewer = await me.query(api.users.current, {});
  const interestId = await test.t.run(async (ctx) => {
    const studentId = await ctx.db.insert("students", {
      ownerSubject: viewer!.id,
      name: "Student",
      major: "CS",
      schoolYear: "junior",
      skills: ["Python"],
      interests: ["Research"],
      experience: [],
      hoursPerWeek: 5,
      workStudy: false,
      seekingCredit: false,
      recruitmentConsent: false,
      embeddingModel: "",
      embedding: [],
    });
    await ctx.db.insert("projects", {
      sourceId: "request-test",
      title: "Research",
      department: "CS",
      description: "Research",
      faculty: "PI",
      ownerId: "faculty-owner",
      requiredSkills: [],
      preferredSkills: [],
      hoursPerWeek: 5,
      offersCredit: false,
      beginnerFriendly: true,
      recruitmentStatus: "open",
      embeddingModel: "",
      embedding: [],
    });
    return ctx.db.insert("interests", {
      studentId,
      sourceId: "request-test",
      status,
      createdAt: 100,
      updatedAt: 100,
    });
  });
  return { ...test, me, interestId };
}

describe("re-sending interest", () => {
  it.each(["interested", "conversation", "accepted", "declined"] as const)(
    "preserves %s requests without notifying faculty again",
    async (status) => {
      const { t, me, interestId } = await requestFixture(status);
      expect(
        await me.mutation(api.interests.expressInterest, {
          sourceId: "request-test",
        }),
      ).toEqual({ interestId });
      const interest = await t.run((ctx) => ctx.db.get(interestId));
      expect(interest?.status).toBe(status);
      expect(interest?.updatedAt).toBe(100);
      expect(
        await t.run((ctx) => ctx.db.query("notifications").collect()),
      ).toHaveLength(0);
    },
  );

  it("reopens a withdrawn request once and notifies its project owner", async () => {
    const { t, me, interestId } = await requestFixture("withdrawn");
    await me.mutation(api.interests.expressInterest, {
      sourceId: "request-test",
    });
    await me.mutation(api.interests.expressInterest, {
      sourceId: "request-test",
    });
    expect((await t.run((ctx) => ctx.db.get(interestId)))?.status).toBe(
      "interested",
    );
    const notices = await t.run((ctx) =>
      ctx.db.query("notifications").collect(),
    );
    expect(notices).toHaveLength(1);
    expect(notices[0].recipientId).toBe("faculty-owner");
  });
});
