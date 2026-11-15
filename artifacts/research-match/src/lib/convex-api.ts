import {
  anyApi,
  type ApiFromModules,
  type FilterApi,
  type FunctionReference,
} from "convex/server";
import type * as users from "../../../api-server/convex/users";
import type * as discovery from "../../../api-server/convex/discovery";
import type * as projects from "../../../api-server/convex/projects";
import type * as faculty from "../../../api-server/convex/faculty";
import type * as interests from "../../../api-server/convex/interests";
import type * as chat from "../../../api-server/convex/chat";

// Type-only backend imports keep server code and credentials out of the bundle.
export const api = anyApi as unknown as FilterApi<
  ApiFromModules<{ users: typeof users; discovery: typeof discovery; projects: typeof projects; faculty: typeof faculty; interests: typeof interests; chat: typeof chat }>,
  FunctionReference<"query" | "mutation" | "action", "public">
>;
