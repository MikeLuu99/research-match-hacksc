import type { StudentProfile } from "./data";
import type { Interest } from "./store";

// Pure helpers only (no runtime imports) so they run under node:test.

/** Direct, non-withdrawn applicant to a given project (or any project when projectId omitted). */
export function isApplicant(studentId: string, interests: Interest[], projectId?: string) {
  return interests.some(
    (i) => i.studentId === studentId && i.status !== "withdrawn" && (!projectId || i.projectId === projectId),
  );
}

/** Faculty may see a demo student's profile only if opted in or directly applied. */
export function canSeeProfile(s: StudentProfile, interests: Interest[], projectId?: string) {
  return s.visible || isApplicant(s.id, interests, projectId);
}

export interface SharedDetails {
  visible: boolean;
  email: string | null;
  resume: string | null;
}

/** Contact and resume each require their own explicit flag. Never invents details. */
export function sharedDetails(s: StudentProfile, interests: Interest[], projectId?: string): SharedDetails {
  const visible = canSeeProfile(s, interests, projectId);
  return {
    visible,
    email: visible && s.shareContact && s.email?.trim() ? s.email.trim() : null,
    resume: visible && s.shareResume && s.resumeText.trim() ? s.resumeText.trim() : null,
  };
}

/** Fictional demo pool plus the browser's sample student. Demo mode only. */
export function demoStudents(fixtures: StudentProfile[], profile: StudentProfile): StudentProfile[] {
  return [...fixtures.filter((s) => s.id !== profile.id), profile];
}
