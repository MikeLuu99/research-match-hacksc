import { describe, expect, it } from "vitest";
import { LABS } from "./labData";
import { api } from "./_generated/api";
import { makeTest, signIn } from "../test/helpers";

describe("labCatalogStatus", () => {
  it("starts empty", async () => {
    const { t } = makeTest();
    expect(await t.query(api.projects.labCatalogStatus, {})).toEqual({
      total: 0,
      embedded: 0,
    });
  });
});

describe("seedLabs", () => {
  it("refuses unauthenticated callers", async () => {
    const { t } = makeTest();
    await expect(t.mutation(api.projects.seedLabs, {})).rejects.toThrow();
  });

  it("refuses non-USC accounts", async () => {
    const test = makeTest();
    const outsider = await signIn(test, "outsider@gmail.com");
    await expect(outsider.mutation(api.projects.seedLabs, {})).rejects.toThrow(
      /@usc\.edu/i,
    );
  });

  it("inserts the full catalog once and updates on re-run", async () => {
    const test = makeTest();
    const prof = await signIn(test, "prof@usc.edu");
    await prof.mutation(api.users.completeProfile, {
      name: "Professor",
      accountType: "faculty",
    });
    const first = await prof.mutation(api.projects.seedLabs, {});
    expect(first).toEqual({ inserted: LABS.length, updated: 0 });
    const second = await prof.mutation(api.projects.seedLabs, {});
    expect(second).toEqual({ inserted: 0, updated: LABS.length });
    const status = await test.t.query(api.projects.labCatalogStatus, {});
    expect(status.total).toBe(LABS.length);
  });
});

describe("myMatches", () => {
  it("reports not-ready without a session instead of throwing", async () => {
    const { t } = makeTest();
    const result = await t.action(api.discovery.myMatches, {});
    expect(result).toEqual({ ready: false, matches: [] });
  });
});

describe("labCandidates", () => {
  it("refuses unauthenticated callers", async () => {
    const { t } = makeTest();
    await expect(
      t.action(api.discovery.labCandidates, { labId: "k57" as never }),
    ).rejects.toThrow();
  });
});
