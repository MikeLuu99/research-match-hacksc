import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAccount } from "@/lib/auth";
import { validateCredentials } from "@/lib/auth-validation";

export type CredentialsMode = "sign-in" | "sign-up";
export const AUTH_COPY = {
  "sign-in": {
    eyebrow: "GOOD TO SEE YOU AGAIN",
    title: "Welcome back.",
    intro: "Pick up where your curiosity left off.",
    button: "Sign in",
    pending: "Signing in…",
    switchPrompt: "New to ResearchMatch?",
    switchLabel: "Create an account",
    switchHref: "/sign-up",
    passwordHint: "Enter your password",
    autocomplete: "current-password",
  },
  "sign-up": {
    eyebrow: "YOUR NEXT CHAPTER STARTS HERE",
    title: "A world of research awaits.",
    intro: "Create your account and discover what’s possible across campus.",
    button: "Create account",
    pending: "Creating your account…",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/sign-in",
    passwordHint: "At least 12 characters",
    autocomplete: "new-password",
  },
};

function PasswordField({
  id,
  label,
  hint,
  autoComplete,
  disabled,
}: {
  id: string;
  label: string;
  hint: string;
  autoComplete: string;
  disabled: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const action = visible ? "Hide" : "Show";
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={hint}
          required
          maxLength={256}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={`${action} ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </div>
  );
}

function formString(data: FormData, name: string) {
  return String(data.get(name) ?? "");
}

function SubmitButton({
  pending,
  mode,
  enabled,
}: {
  pending: boolean;
  mode: CredentialsMode;
  enabled: boolean;
}) {
  const copy = AUTH_COPY[mode];
  const label = pending ? copy.pending : copy.button;
  return (
    <button
      className="public-button auth-submit"
      disabled={pending || !enabled}
    >
      {pending && <LoaderCircle className="animate-spin" size={18} />}
      {label}
      <ArrowUpRight size={18} />
    </button>
  );
}

export function CredentialsForm({ mode }: { mode: CredentialsMode }) {
  const account = useAccount();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const copy = AUTH_COPY[mode];
  const signingUp = mode === "sign-up";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = formString(data, "email");
    const password = formString(data, "password");
    const confirmation = signingUp
      ? formString(data, "confirm-password")
      : undefined;
    const validation = validateCredentials(email, password, confirmation);
    setError(validation ?? "");
    if (validation) return;
    setPending(true);
    try {
      if (signingUp)
        await account.signUp(email, password, formString(data, "name"));
      else await account.signIn(email, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn’t connect. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {!account.isConfigured && (
        <div className="auth-notice" role="status">
          Account access isn’t available yet. You can still{" "}
          <Link href="/demo">explore the demo</Link>.
        </div>
      )}
      <form className="auth-form" onSubmit={submit}>
        {signingUp && (
          <div className="auth-field">
            <label htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              minLength={2}
              maxLength={80}
              required
              disabled={pending}
            />
          </div>
        )}
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="you@usc.edu"
            maxLength={100}
            required
            disabled={pending}
          />
        </div>
        <PasswordField
          id="password"
          label="Password"
          hint={copy.passwordHint}
          autoComplete={copy.autocomplete}
          disabled={pending}
        />
        {signingUp && (
          <PasswordField
            id="confirm-password"
            label="Confirm password"
            hint="Repeat your password"
            autoComplete="new-password"
            disabled={pending}
          />
        )}
        {signingUp && (
          <p className="auth-help">
            Use a unique passphrase. USC or faculty affiliation is not verified
            at sign-up.
          </p>
        )}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <SubmitButton
          pending={pending}
          mode={mode}
          enabled={account.isConfigured}
        />
      </form>
      <p className="auth-switch">
        {copy.switchPrompt}{" "}
        <Link href={copy.switchHref}>{copy.switchLabel}</Link>
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
