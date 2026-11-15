// Shared in-memory test helpers. The underscore prefix keeps this file out of
// the Convex function bundle.
import { convexTest } from "convex-test";
import { register as registerBetterAuth } from "@convex-dev/better-auth/test";
import { createClient } from "@convex-dev/better-auth";
import type { BetterAuthOptions } from "better-auth";
import type { DataModel } from "../convex/model";
import schema from "../convex/schema";

const modules = import.meta.glob(
  ["../convex/**/*.ts", "!../convex/**/*.test.ts"],
  { query: "?fullPath" },
);

type TestConvex = ReturnType<typeof convexTest>;

export type TestContext = {
  t: TestConvex;
  componentApi: Parameters<typeof createClient<DataModel>>[0];
};

// Register the Better Auth component exactly once per test instance; repeated
// registration resets the in-memory id counter and collides fixture identities.
export function makeTest(): TestContext {
  const t = convexTest(schema, modules);
  const componentApi = registerBetterAuth(t, "betterAuth");
  return { t, componentApi: componentApi as TestContext["componentApi"] };
}

// Drives the real auth-component code path: each fixture user gets a Better
// Auth user + session row, so functions calling safeGetAuthUser behave as they
// do in production.
export async function signIn(
  { t, componentApi }: TestContext,
  email: string,
): Promise<ReturnType<TestConvex["withIdentity"]>> {
  const ctx = {
    runMutation: t.mutation.bind(t),
    runQuery: t.query.bind(t),
  } as never;
  const adapter = createClient<DataModel>(componentApi, {
    verbose: false,
  }).adapter(ctx)({} as BetterAuthOptions);
  const user = await adapter.create({
    model: "user",
    data: {
      name: email.split("@")[0],
      email,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const session = await adapter.create({
    model: "session",
    data: {
      token: `token-${email}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: (user as { id: string }).id,
    },
  });
  return t.withIdentity({
    subject: (user as { id: string }).id,
    sessionId: (session as { id: string }).id,
  });
}
