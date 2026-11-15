import assert from "node:assert/strict";
import test from "node:test";
import type { StudentProfile } from "./data";
import type { Interest } from "./store";
import { canSeeProfile, demoStudents, isApplicant, sharedDetails } from "./faculty-access.ts";

const student = (over: Partial<StudentProfile> = {}): StudentProfile => ({
  id: "s-test", name: "Test Student", major: "Linguistics", year: "Junior", skills: [], interests: [],
  hours: 8, wantsCredit: false, wantsPaid: false, bio: "", resumeText: "Line one", visible: true,
  email: "test@example.com", ...over,
});
const interest = (over: Partial<Interest> = {}): Interest => ({
  id: "i-1", projectId: "p-1", studentId: "s-test", studentName: "Test Student", status: "interested",
  message: "", createdAt: "", updatedAt: "", ...over,
});

test("private students are hidden unless they applied to that project", () => {
  const s = student({ visible: false });
  assert.equal(canSeeProfile(s, [], "p-1"), false);
  assert.equal(canSeeProfile(s, [interest()], "p-1"), true);
  assert.equal(canSeeProfile(s, [interest()], "p-2"), false);
  assert.equal(canSeeProfile(s, [interest({ status: "withdrawn" })], "p-1"), false);
  assert.equal(isApplicant("s-test", [interest()]), true);
});

test("email and resume need separate explicit consent, defaulting to hidden", () => {
  assert.deepEqual(sharedDetails(student(), []), { visible: true, email: null, resume: null });
  const contactOnly = sharedDetails(student({ shareContact: true }), []);
  assert.equal(contactOnly.email, "test@example.com");
  assert.equal(contactOnly.resume, null);
  const resumeOnly = sharedDetails(student({ shareResume: true }), []);
  assert.equal(resumeOnly.email, null);
  assert.equal(resumeOnly.resume, "Line one");
});

test("consent flags never leak details of a profile that is not visible", () => {
  const s = student({ visible: false, shareContact: true, shareResume: true });
  assert.deepEqual(sharedDetails(s, [], "p-1"), { visible: false, email: null, resume: null });
});

test("blank shared fields are reported as not shared, not invented", () => {
  const s = student({ shareContact: true, shareResume: true, email: "  ", resumeText: "" });
  assert.deepEqual(sharedDetails(s, []), { visible: true, email: null, resume: null });
});

test("demo pool includes the sample student once", () => {
  const me = student({ id: "s-me" });
  const pool = demoStudents([student(), me], me);
  assert.equal(pool.filter((s) => s.id === "s-me").length, 1);
  assert.equal(pool.length, 2);
});
