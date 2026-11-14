import { createContext, useContext, type ReactNode } from "react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import {
  ConvexReactClient,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";
import { authClient } from "./auth-client";
import { api } from "./convex-api";
import { authErrorMessage, type AccountType } from "./auth-validation";

interface Account {
  isConfigured: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  viewer:
    | {
        id: string;
        name: string | null;
        accountType: AccountType | null;
        hasStudentProfile: boolean;
      }
    | null
    | undefined;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  completeProfile: (name: string, accountType: AccountType) => Promise<null>;
}

const unavailable = async (): Promise<never> => {
  throw new Error("Account access isn’t available yet.");
};
const AccountContext = createContext<Account>({
  isConfigured: false,
  isAuthenticated: false,
  isLoading: false,
  viewer: null,
  signInWithGoogle: unavailable,
  signOut: unavailable,
  completeProfile: unavailable,
});

const convexUrl = import.meta.env.VITE_CONVEX_URL?.trim();
const authUrl = import.meta.env.VITE_CONVEX_SITE_URL?.trim();
const convex = convexUrl && authUrl ? new ConvexReactClient(convexUrl) : null;

function ConnectedAccount({ children }: { children: ReactNode }) {
  // Better Auth can have a session before Convex validates its JWT. Gate private
  // queries and routes on Convex's authentication state.
  const { isAuthenticated, isLoading } = useConvexAuth();
  const viewer = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const completeProfileMutation = useMutation(api.users.completeProfile);
  const value: Account = {
    isConfigured: true,
    isAuthenticated,
    isLoading: isLoading || (isAuthenticated && viewer === undefined),
    viewer,
    signInWithGoogle: async () => {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}${import.meta.env.BASE_URL}app`,
      });
      if (result.error)
        throw new Error(
          authErrorMessage({ error: result.error.code ?? "OTHER_ERROR" }),
        );
    },
    signOut: async () => {
      const result = await authClient.signOut();
      if (result.error)
        throw new Error("We couldn’t sign you out. Please try again.");
    },
    completeProfile: (name, accountType) =>
      completeProfileMutation({ name, accountType }),
  };
  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function AccountProvider({ children }: { children: ReactNode }) {
  if (!convex) return <>{children}</>;
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <ConnectedAccount>{children}</ConnectedAccount>
    </ConvexBetterAuthProvider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
