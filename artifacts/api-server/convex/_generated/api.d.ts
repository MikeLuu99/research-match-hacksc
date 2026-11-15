/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as compatibility from "../compatibility.js";
import type * as demoStudent from "../demoStudent.js";
import type * as discovery from "../discovery.js";
import type * as embeddings from "../embeddings.js";
import type * as faculty from "../faculty.js";
import type * as http from "../http.js";
import type * as interests from "../interests.js";
import type * as labData from "../labData.js";
import type * as matching from "../matching.js";
import type * as model from "../model.js";
import type * as notificationText from "../notificationText.js";
import type * as notifications from "../notifications.js";
import type * as photos from "../photos.js";
import type * as projects from "../projects.js";
import type * as ranking from "../ranking.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  chat: typeof chat;
  compatibility: typeof compatibility;
  demoStudent: typeof demoStudent;
  discovery: typeof discovery;
  embeddings: typeof embeddings;
  faculty: typeof faculty;
  http: typeof http;
  interests: typeof interests;
  labData: typeof labData;
  matching: typeof matching;
  model: typeof model;
  notificationText: typeof notificationText;
  notifications: typeof notifications;
  photos: typeof photos;
  projects: typeof projects;
  ranking: typeof ranking;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
