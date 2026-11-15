import { useAccount } from "./auth";

/** Signed-in faculty use live consented data; everyone else sees the fictional demo. */
export function useFacultyMode(): "live" | "demo" {
  const account = useAccount();
  return account.isAuthenticated && account.viewer?.accountType === "faculty"
    ? "live"
    : "demo";
}
