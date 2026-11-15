import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    include: ["convex/**/*.test.ts"],
  },
  server: {
    deps: {
      // convex-test needs import.meta.glob support at runtime.
      inline: ["convex-test", "@convex-dev/better-auth"],
    },
  },
});
