import { useState, type FormEvent } from "react";
import { Redirect } from "wouter";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { chooseRole } from "@/pages/landing";
import { useAccount } from "@/lib/auth";
import type { AccountType } from "@/lib/auth-validation";
import { AuthFrame } from "@/components/auth-frame";
import {
  AUTH_COPY,
  CredentialsForm,
  type CredentialsMode,
} from "@/components/auth-form";
import { StudentProfileForm } from "@/components/student-profile-form";
import { UscEmailGate } from "@/components/usc-email-gate";

function readRole(): AccountType {
  try {
    const role = sessionStorage.getItem("labbe.role");
    return role === "faculty" ? "faculty" : "student";
  } catch {
    return "student";
  }
}

function OnboardingForm() {
  const { completeProfile, viewer } = useAccount();
  const [accountType, setAccountType] = useState<AccountType>(readRole);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(
      new FormData(event.currentTarget).get("name") ?? "",
    ).trim();
    setError("");
    setPending(true);
    try {
      await completeProfile(name, accountType);
    } catch {
      setError("We couldn’t save your profile. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="auth-form">
      <div className="auth-field">
        <label htmlFor="name">Full name</label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          defaultValue={viewer?.name ?? ""}
          minLength={2}
          maxLength={80}
          required
          disabled={pending}
        />
      </div>
      <p className="auth-help">
        You’re joining as a{" "}
        <strong>{accountType === "faculty" ? "faculty member" : "student"}</strong>{" "}
        — picked on the home page.{" "}
        <button
          type="button"
          onClick={() => {
            const next: AccountType =
              accountType === "student" ? "faculty" : "student";
            chooseRole(next);
            setAccountType(next);
          }}
        >
          Switch to {accountType === "student" ? "faculty" : "student"}
        </button>
      </p>
      <p className="auth-help">
        Your profile starts private. You decide when to share it with research
        teams.
      </p>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <button className="public-button auth-submit" disabled={pending}>
        {pending ? (
          <LoaderCircle className="animate-spin" size={18} />
        ) : (
          <>
            Open my workspace
            <ArrowUpRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}

const SETUP_COPY = {
  eyebrow: "ONE MORE INTRODUCTION",
  title: "Make yourself at home.",
  intro:
    "Tell us a little about yourself. We’ll point you in the right direction.",
};

function CredentialsPage({ mode }: { mode: CredentialsMode }) {
  return (
    <AuthFrame {...AUTH_COPY[mode]}>
      <CredentialsForm />
    </AuthFrame>
  );
}

export default function AuthPage({
  mode,
}: {
  mode: CredentialsMode | "onboarding";
}) {
  const account = useAccount();
  if (account.isLoading)
    return (
      <AuthFrame {...SETUP_COPY}>
        <div className="auth-loading" role="status">
          <LoaderCircle className="animate-spin" size={23} />
          Getting your account ready…
        </div>
      </AuthFrame>
    );
  if (account.viewer?.accountType === "student" && !account.viewer.hasStudentProfile)
    return (
      <AuthFrame
        eyebrow="YOUR RESEARCH PROFILE"
        title="Tell us about your work."
        intro="A few details help us match you with projects worth your time."
      >
        <StudentProfileForm />
      </AuthFrame>
    );
  if (account.viewer?.accountType)
    return (
      <Redirect
        to={account.viewer.accountType === "faculty" ? "/app/faculty" : "/app/student"}
        replace
      />
    );
  if (account.isAuthenticated && !account.viewer?.uscEmail)
    return <UscEmailGate />;
  if (account.isAuthenticated)
    return (
      <AuthFrame {...SETUP_COPY}>
        <OnboardingForm />
      </AuthFrame>
    );
  if (mode === "onboarding") return <Redirect to="/sign-in" replace />;
  return <CredentialsPage mode={mode} />;
}
