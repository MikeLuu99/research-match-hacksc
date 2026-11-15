import { useCallback, useMemo } from "react";
import {
  useQuery as useConvexQuery,
  useMutation as useConvexMutation,
  useAction as useConvexAction,
  type ReactMutation,
  type ReactAction,
} from "convex/react";
import type { FunctionReference } from "convex/server";

const backendConfigured = Boolean(
  import.meta.env.VITE_CONVEX_URL?.trim() &&
  import.meta.env.VITE_CONVEX_SITE_URL?.trim(),
);

// Vite configuration is fixed for the lifetime of this build. Selecting the
// hooks here keeps the offline demo independent of a Convex provider, without
// changing hook order when account/session state changes.
const useOfflineQuery: typeof useConvexQuery = () => undefined;

function useOfflineMutation<Mutation extends FunctionReference<"mutation">>(
  _reference: Mutation,
): ReactMutation<Mutation> {
  return useMemo(() => {
    const mutation: ReactMutation<Mutation> = Object.assign(
      async () => { throw new Error("Connect the backend to save account data."); },
      { withOptimisticUpdate: () => mutation },
    );
    return mutation;
  }, []);
}

function useOfflineAction<Action extends FunctionReference<"action">>(
  _reference: Action,
): ReactAction<Action> {
  return useCallback(async () => {
    throw new Error("Connect the backend to use AI features.");
  }, []);
}

export const useQuery = backendConfigured ? useConvexQuery : useOfflineQuery;
export const useMutation = backendConfigured ? useConvexMutation : useOfflineMutation;
export const useAction = backendConfigured ? useConvexAction : useOfflineAction;
