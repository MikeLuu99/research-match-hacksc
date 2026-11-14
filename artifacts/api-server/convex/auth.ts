import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import type { ComponentApi } from "@convex-dev/better-auth/_generated/component.js";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { componentsGeneric } from "convex/server";
import authConfig from "./auth.config";
import type { DataModel } from "./model";

// Mirrors the betterAuth mount in convex.config.ts, without requiring a
// deployment or generated files just to typecheck the repository in CI.
const components = componentsGeneric() as unknown as {
  betterAuth: ComponentApi;
};
export const authComponent = createClient<DataModel>(components.betterAuth);
export const siteUrl = process.env.SITE_URL ?? "http://localhost:5173";

export function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    appName: "ResearchMatch",
    baseURL: process.env.CONVEX_SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    rateLimit: { enabled: true, storage: "database" },
    plugins: [crossDomain({ siteUrl }), convex({ authConfig })],
  });
}
