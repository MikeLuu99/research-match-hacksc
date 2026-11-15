import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { useAccount } from "@/lib/auth";

export type CredentialsMode = "sign-in" | "sign-up";
export const AUTH_COPY = {
  "sign-in": {
    eyebrow: "GOOD TO SEE YOU AGAIN",
    title: "Welcome back.",
    intro: "Pick up where your curiosity left off.",
    switchPrompt: "New to LABBE?",
    switchLabel: "Create an account",
    switchHref: "/sign-up",
  },
  "sign-up": {
    eyebrow: "YOUR NEXT CHAPTER STARTS HERE",
    title: "A world of research awaits.",
    intro: "Create your account and discover what’s possible across campus.",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/sign-in",
  },
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.75 2 2.9 6.32 2.9 12c0 5.51 4.49 10 9.79 10 5.14 0 9.41-3.72 9.41-9.26 0-1.13-.35-1.34-.75-1.64z"
      />
    </svg>
  );
}

export function CredentialsForm() {
  const account = useAccount();
  const [error, setError] = useState("");
  const [googlePending, setGooglePending] = useState(false);

  return (
    <>
      {!account.isConfigured && (
        <div className="auth-notice" role="status">
          Account access isn’t available yet. You can still{" "}
          <Link href="/demo">explore the demo</Link>.
        </div>
      )}
      <p className="auth-intro-google">
        Sign in with your USC Google account (email ending in @usc.edu). No password needed.
      </p>
      <button
        type="button"
        className="public-button auth-google"
        disabled={!account.isConfigured || googlePending}
        onClick={() => {
          setGooglePending(true);
          account.signInWithGoogle().catch((err: unknown) => {
            setGooglePending(false);
            setError(
              err instanceof Error
                ? err.message
                : "We couldn’t start Google sign-in. Please try again.",
            );
          });
        }}
      >
        {googlePending ? (
          <LoaderCircle className="animate-spin" size={18} />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <p className="auth-switch">
        Any Google account works today. USC affiliation isn’t verified at
        sign-up.
      </p>
      <div className="auth-divider">
        <span />
        or take a look around
        <span />
      </div>
      <Link className="demo-button" href="/demo">
        Explore the demo
        <ArrowUpRight size={17} />
      </Link>
    </>
  );
}
