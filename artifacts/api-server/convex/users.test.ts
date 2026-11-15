import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import type { BetterAuthOptions } from "better-auth";
import { register as registerBetterAuth } from "@convex-dev/better-auth/test";
import { createClient } from "@convex-dev/better-auth";
import type { DataModel } from "./model";
import schema from "./schema";
import { api } from "./_generated/api";

const modules = import.meta.glob("./**/*.ts", { query: "?fullPath" });

type TestConvex = ReturnType<typeof convexTest>;

// Register the Better Auth component exactly once per test instance; repeated
// registration resets the in-memory id counter and collides fixture identities.
type TestContext = {
  t: TestConvex;
  componentApi: Parameters<typeof createClient<DataModel>>[0];
};

function makeTest(): TestContext {
  const t = convexTest(schema, modules);
  const componentApi = registerBetterAuth(t, "betterAuth");
  return { t, componentApi: componentApi as TestContext["componentApi"] };
}

// Drives the real auth-component code path: each fixture user gets a Better
// Auth user + session row, so functions calling safeGetAuthUser behave as they
// do in production.
async function signIn({ t, componentApi }: TestContext, email: string) {
  const ctx = {
    runMutation: t.mutation.bind(t),
    runQuery: t.query.bind(t),
  } as never;
  const adapter = createClient<DataModel>(componentApi, {
    verbose: false,
  }).adapter(ctx)({} as BetterAuthOptions);
  const user = await adapter.create({
    model: "user",
    data: {
      name: email.split("@")[0],
      email,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const session = await adapter.create({
    model: "session",
    data: {
      token: `token-${email}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: (user as { id: string }).id,
    },
  });
  return t.withIdentity({
    subject: (user as { id: string }).id,
    sessionId: (session as { id: string }).id,
  });
}

const PROFILE = {
  major: "Computer Science",
  schoolYear: "junior" as const,
  skills: ["Python", "React"],
  interests: ["healthcare", "machine learning"],
  experience: [
    { role: "Course grader", org: "USC CS", description: "CSCI 201" },
  ],
  hoursPerWeek: 10,
  workStudy: false,
  seekingCredit: true,
  recruitmentConsent: true,
};

describe("current", () => {
  it("returns null without a session", async () => {
    const t = makeTest().t;
    expect(await t.query(api.users.current, {})).toBeNull();
  });

  it("reports hasStudentProfile for an account without a profile", async () => {
    const test = makeTest();
    const me = await signIn(test, "student@usc.edu");
    await me.mutation(api.users.completeProfile, {
      name: "Sam Student",
      accountType: "student",
    });
    const current = await me.query(api.users.current, {});
    expect(current).toMatchObject({
      accountType: "student",
      hasStudentProfile: false,
    });
  });
});

describe("completeProfile", () => {
  it("requires authentication", async () => {
    const t = makeTest().t;
    await expect(
      t.mutation(api.users.completeProfile, {
        name: "Anon",
        accountType: "student",
      }),
    ).rejects.toThrow();
  });

  it("is idempotent: the first profile wins", async () => {
    const test = makeTest();
    const me = await signIn(test, "student@usc.edu");
    await me.mutation(api.users.completeProfile, {
      name: "Sam Student",
      accountType: "student",
    });
    await me.mutation(api.users.completeProfile, {
      name: "Renamed",
      accountType: "faculty",
    });
    expect(await me.query(api.users.current, {})).toMatchObject({
      name: "Sam Student",
      accountType: "student",
    });
  });
});

describe("upsertStudentProfile", () => {
  it("refuses unauthenticated callers", async () => {
    const t = makeTest().t;
    await expect(t.mutation(api.users.upsertStudentProfile, PROFILE)).rejects
      .toThrow();
  });

  it("refuses non-student accounts", async () => {
    const test = makeTest();
    const me = await signIn(test, "prof@usc.edu");
    await me.mutation(api.users.completeProfile, {
      name: "Professor P",
      accountType: "faculty",
    });
    await expect(me.mutation(api.users.upsertStudentProfile, PROFILE)).rejects
      .toThrow(/student/i);
  });

  it("creates then updates the caller's own profile", async () => {
    const test = makeTest();
    const me = await signIn(test, "student@usc.edu");
    await me.mutation(api.users.completeProfile, {
      name: "Sam Student",
      accountType: "student",
    });
    await me.mutation(api.users.upsertStudentProfile, PROFILE);
    const mine = await me.query(api.users.myStudentProfile, {});
    expect(mine).toMatchObject({
      major: "Computer Science",
      recruitmentConsent: true,
      hoursPerWeek: 10,
    });
    await me.mutation(api.users.upsertStudentProfile, {
      ...PROFILE,
      major: "Biomedical Engineering",
      hoursPerWeek: 5,
    });
    const updated = await me.query(api.users.myStudentProfile, {});
    expect(updated).toMatchObject({
      major: "Biomedical Engineering",
      hoursPerWeek: 5,
    });
    expect(await me.query(api.users.current, {})).toMatchObject({
      hasStudentProfile: true,
    });
  });

  it("rejects an empty major and profiles without skills or interests", async () => {
    const test = makeTest();
    const me = await signIn(test, "student@usc.edu");
    await me.mutation(api.users.completeProfile, {
      name: "Sam Student",
      accountType: "student",
    });
    await expect(
      me.mutation(api.users.upsertStudentProfile, {
        ...PROFILE,
        major: "   ",
      }),
    ).rejects.toThrow(/major/i);
    await expect(
      me.mutation(api.users.upsertStudentProfile, {
        ...PROFILE,
        skills: [],
        interests: [],
      }),
    ).rejects.toThrow(/skill/i);
  });

  it("scopes profiles per user: another student's profile is invisible", async () => {
    const test = makeTest();
    const alice = await signIn(test, "alice@usc.edu");
    await alice.mutation(api.users.completeProfile, {
      name: "Alice",
      accountType: "student",
    });
    await alice.mutation(api.users.upsertStudentProfile, PROFILE);
    const bob = await signIn(test, "bob@usc.edu");
    await bob.mutation(api.users.completeProfile, {
      name: "Bob",
      accountType: "student",
    });
    expect(await bob.query(api.users.myStudentProfile, {})).toBeNull();
  });
});

describe("listStudents", () => {
  async function seedStudent(
    test: TestContext,
    email: string,
    consent: boolean,
  ) {
    const me = await signIn(test, email);
    await me.mutation(api.users.completeProfile, {
      name: email.split("@")[0],
      accountType: "student",
    });
    await me.mutation(api.users.upsertStudentProfile, {
      ...PROFILE,
      recruitmentConsent: consent,
    });
    return me;
  }

  it("refuses unauthenticated and student callers", async () => {
    const test = makeTest();
    await expect(test.t.query(api.users.listStudents, {})).rejects.toThrow();
    const student = await seedStudent(test, "alice@usc.edu", true);
    await expect(student.query(api.users.listStudents, {})).rejects.toThrow(
      /faculty/i,
    );
  });

  it("returns only recruitment-consented students to faculty", async () => {
    const test = makeTest();
    await seedStudent(test, "opted-in@usc.edu", true);
    await seedStudent(test, "private@usc.edu", false);
    const prof = await signIn(test, "prof@usc.edu");
    await prof.mutation(api.users.completeProfile, {
      name: "Professor P",
      accountType: "faculty",
    });
    const list = await prof.query(api.users.listStudents, {});
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ major: "Computer Science" });
    expect(JSON.stringify(list)).not.toContain("resumeStorageId");
  });
});
