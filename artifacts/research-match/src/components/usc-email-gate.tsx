import { useState } from "react";
import { LoaderCircle, ShieldAlert } from "lucide-react";
import { useAccount } from "@/lib/auth";

// Shown when a signed-in account's Google email doesn't end in @usc.edu.
export function UscEmailGate() {
  const account = useAccount();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState(false);
  const email = account.viewer?.email ?? "";
  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center" role="alert">
      <ShieldAlert className="mx-auto text-primary" size={28} />
      <h1 className="font-display mt-4 text-3xl">USC email required</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        You signed in as{" "}
        <span className="font-semibold text-foreground">{email}</span>. LABBE
        accounts need a USC email ending in{" "}
        <span className="font-mono">@usc.edu</span>. Sign out and try again with
        your USC Google account.
      </p>
      {error && (
        <p className="mt-3 text-xs text-destructive">
          Couldn’t sign out automatically. Please try again.
        </p>
      )}
      <button
        className="public-button mt-6"
        disabled={signingOut}
        onClick={async () => {
          setSigningOut(true);
          try {
            await account.signOut();
          } catch {
            setError(true);
          } finally {
            setSigningOut(false);
          }
        }}
      >
        {signingOut && <LoaderCircle className="animate-spin" size={16} />}
        Sign out
      </button>
    </div>
  );
}
