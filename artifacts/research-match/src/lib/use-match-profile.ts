import { useQuery } from "./backend";
import { api } from "./convex-api";
import { useAccount } from "./auth";
import { useStore } from "./store";
import type { StudentProfile } from "./data";

// The profile used for demo matching. Signed-in students match against
// their REAL saved Convex profile; visitors match the browser-local
// sample profile. Prevents the all-labs-flatline when the local profile
// is empty.
export function useMatchProfile(): StudentProfile {
  const account = useAccount();
  const { profile } = useStore();
  const live = useQuery(
    api.users.myStudentProfile,
    account.isAuthenticated &&
      account.viewer?.accountType === "student" &&
      account.viewer.hasStudentProfile
      ? {}
      : "skip",
  );

  if (live) {
    return {
      ...profile,
      id: live._id,
      name: live.name,
      major: live.major,
      year: live.schoolYear,
      skills: live.skills,
      interests: live.interests,
      hours: live.hoursPerWeek,
      wantsCredit: live.seekingCredit,
      wantsPaid: false,
      bio: live.bio ?? "",
      resumeText: "",
      visible: live.recruitmentConsent,
    };
  }
  return profile;
}
