import {
  anyApi,
  type ApiFromModules,
  type FilterApi,
  type FunctionReference,
} from "convex/server";
import type * as users from "../../../api-server/convex/users";

// Type-only backend imports keep server code and credentials out of the bundle.
export const api = anyApi as unknown as FilterApi<
  ApiFromModules<{ users: typeof users }>,
  FunctionReference<"query" | "mutation", "public">
>;
