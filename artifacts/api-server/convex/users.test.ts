import { describe, expect, it } from "vitest";
import { makeTest, signIn, type TestContext } from "../test/helpers";
import { REQUIRE_USC_EMAIL } from "./users";
import { api } from "./_generated/api";

const PROFILE = {
  major: "Computer Science",
  schoolYear: "junior" as const,
  minors: [],
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
    const { t } = makeTest();
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
  it.skipIf(!REQUIRE_USC_EMAIL)("rejects non-USC email addresses", async () => {
    const test = makeTest();
    const me = await signIn(test, "outsider@gmail.com");
    await expect(
      me.mutation(api.users.completeProfile, {
        name: "Outsider",
        accountType: "student",
      }),
    ).rejects.toThrow(/@usc\.edu/i);
  });

  it("requires authentication", async () => {
    const { t } = makeTest();
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
    const { t } = makeTest();
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
