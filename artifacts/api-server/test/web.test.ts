// @vitest-environment node
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build, type Plugin } from "esbuild";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  it,
  vi,
} from "vitest";

// Exercise the actual web routes without a browser, network, or live credentials.
// esbuild is already an API dev dependency; no extra web test runner is needed.
const webRoot = fileURLToPath(
  new URL("../../research-match/", import.meta.url),
);
const project = {
  id: "convex-project-1",
  sourceId: "fac-project-1",
  title: "Faculty bookmark regression project",
  lab: "Test Lab",
  pi: "Test Professor",
  department: "Computer Science",
  summary: "A project with different document and source identifiers.",
  description: "Test research project",
  requiredSkills: ["Python"],
  niceSkills: [],
  minHours: 5,
  maxHours: 10,
  paid: true,
  credit: false,
  status: "open",
  level: "beginner",
  eligibleMajors: ["Any"],
  keywords: [],
};

const connectedFixtures: Plugin = {
  name: "authenticated-student-fixtures",
  setup(builder) {
    builder.onLoad({ filter: /[/\\]lib[/\\]auth\.tsx$/ }, () => ({
      loader: "tsx",
      contents: `
        export const AccountProvider = ({ children }) => children;
        export const useAccount = () => ({
          isConfigured: true, isAuthenticated: true, isLoading: false,
          viewer: { id: "test-student", name: "Test Student", uscEmail: true,
            accountType: "student", hasStudentProfile: true }
        });
      `,
    }));
    builder.onLoad({ filter: /[/\\]lib[/\\]backend\.ts$/ }, () => ({
      loader: "ts",
      resolveDir: webRoot,
      contents: `
        import { getFunctionName } from "convex/server";
        export function useQuery(reference, args) {
          if (args === "skip") return undefined;
          switch (getFunctionName(reference)) {
            case "faculty:publishedProjects": return [${JSON.stringify(project)}];
            case "interests:myInterests": return [];
            case "users:myStudentProfile": return {
              _id: "student-profile", name: "Test Student", major: "Computer Science",
              schoolYear: "Junior", skills: ["Python"], interests: ["Research"],
              hoursPerWeek: 10, seekingCredit: false, recruitmentConsent: false
            };
            default: return undefined;
          }
        }
        export const useMutation = () => async () => null;
        export const useAction = () => async () => null;
      `,
    }));
  },
};

type WebBundle = {
  renderRoute: (route: string) => { html: string; redirect?: string };
  normalizeSavedProjectIds: (
    saved: string[],
    projects: { id: string; sourceId?: string }[],
  ) => string[];
};

let directory: string;
let offline: WebBundle;
let connected: WebBundle;
let storage: Map<string, string>;

async function bundle(
  name: string,
  plugins: Plugin[] = [],
): Promise<WebBundle> {
  const outfile = path.join(directory, `${name}.mjs`);
  await build({
    stdin: {
      contents: `
        import { createElement } from "react";
        import { renderToStaticMarkup } from "react-dom/server";
        import { Router } from "wouter";
        import App from "./src/App";
        export { normalizeSavedProjectIds } from "./src/lib/saved-projects";
        export function renderRoute(route) {
          const context = {};
          const html = renderToStaticMarkup(createElement(Router,
            { ssrPath: route, ssrContext: context }, createElement(App)));
          return { html, redirect: context.redirectTo };
        }
      `,
      resolveDir: webRoot,
      loader: "tsx",
    },
    tsconfig: path.join(webRoot, "tsconfig.json"),
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    jsx: "automatic",
    banner: {
      js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
    },
    define: {
      "import.meta.env": JSON.stringify({
        BASE_URL: "/",
        VITE_CONVEX_URL: "",
        VITE_CONVEX_SITE_URL: "",
      }),
    },
    plugins,
    logLevel: "silent",
  });
  return import(/* @vite-ignore */ pathToFileURL(outfile).href);
}

beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "researchmatch-web-test-"));
  [offline, connected] = await Promise.all([
    bundle("offline"),
    bundle("connected", [connectedFixtures]),
  ]);
}, 30_000);

beforeEach(() => {
  storage = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
});

afterEach(() => vi.unstubAllGlobals());
afterAll(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});

it.each([
  "/",
  "/sign-in",
  "/demo",
  "/demo/student",
  "/demo/faculty",
  "/demo/saved",
])("renders %s without Convex configuration or a provider", (route) => {
  const result = offline.renderRoute(route);
  expect(result.html.length).toBeGreaterThan(1_000);
  expect(result.html).not.toContain("Something went wrong");
});

it("keeps the private workspace behind sign-in in an offline build", () => {
  expect(offline.renderRoute("/app").redirect).toBe("~/sign-in");
});

it("links the empty live interest tracker to the existing student route", () => {
  const { html } = connected.renderRoute("/app/applications");
  const link = html.match(/<a[^>]*data-testid="link-discover"[^>]*>/)?.[0];
  expect(link).toContain('href="/app/student"');
  expect(html).not.toContain('href="/app/app/student"');
});

it.each([
  ["an AI/chat bookmark", [project.sourceId]],
  ["an older catalog bookmark", [project.id]],
  ["both historical identifiers", [project.id, project.sourceId]],
])(
  "shows %s exactly once in Saved with its bookmark selected",
  (_label, saved) => {
    storage.set(
      "researchmatch.demo.v2.account.test-student",
      JSON.stringify({ saved }),
    );
    const { html } = connected.renderRoute("/app/saved");
    expect(
      html.match(/data-testid="card-project-convex-project-1"/g),
    ).toHaveLength(1);
    expect(html).toMatch(
      /data-testid="button-save-fac-project-1"[^>]*aria-label="Remove from saved"/,
    );
  },
);

it("normalizes legacy IDs when listings arrive while retaining other saved projects", () => {
  const saved = [project.id, project.sourceId, "usc-project", "not-loaded-yet"];
  const pending = offline.normalizeSavedProjectIds(saved, []);
  expect(pending).toEqual(saved);
  expect(offline.normalizeSavedProjectIds(pending, [project])).toEqual([
    project.sourceId,
    "usc-project",
    "not-loaded-yet",
  ]);
});
