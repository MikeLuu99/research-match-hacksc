import {
  anyApi,
  type ApiFromModules,
  type FilterApi,
  type FunctionReference,
} from "convex/server";
import type * as users from "../../../api-server/convex/users";
import type * as discovery from "../../../api-server/convex/discovery";
import type * as projects from "../../../api-server/convex/projects";

// Type-only backend imports keep server code and credentials out of the bundle.
export const api = anyApi as unknown as FilterApi<
  ApiFromModules<{ users: typeof users; discovery: typeof discovery; projects: typeof projects }>,
  FunctionReference<"query" | "mutation" | "action", "public">
>;
