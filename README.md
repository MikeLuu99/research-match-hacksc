# LABBE

Research discovery across USC departments, with a public landing page, student
and faculty onboarding, and email/password accounts using **Better Auth with
Convex**. This is an independent prototype, not an official USC service.

## Run locally

Use Node.js 24 and the pinned pnpm version in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:5173`. The landing page and public demo work without
Convex credentials. Sign-in and sign-up explain that account access is
unavailable until both public Convex URLs are configured.

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/sign-up` | Create an account with Better Auth |
| `/sign-in` | Sign in to an existing account |
| `/onboarding` | Complete a signed-in student or faculty profile |
| `/demo` | Explore fictional research data without an account |
| `/app` | Signed-in prototype workspace |

For the optional Express status API, run this in a separate terminal:

```sh
PORT=3001 pnpm --filter @workspace/api-server dev
```

Vite proxies `/api` to `http://localhost:3001` by default. `PORT`, `BASE_PATH`,
and `API_PROXY_TARGET` can override the frontend development defaults.

## Configure Better Auth and Convex

1. From the repository root, associate the backend with your Convex project:

   ```sh
   pnpm --filter @workspace/api-server exec convex dev
   ```

2. Configure **deployment environment variables** in Convex:

   ```sh
   pnpm --filter @workspace/api-server exec convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
   pnpm --filter @workspace/api-server exec convex env set SITE_URL http://localhost:5173
   ```

   Generate a secret once per deployment and keep it private. For production,
   set `SITE_URL` to the exact HTTPS frontend origin. `CONVEX_SITE_URL` is supplied
   by Convex; Better Auth uses it for its backend URL. The adapter registers
   Better Auth HTTP routes and CORS for the configured frontend origin.

3. Copy `artifacts/research-match/.env.example` to
   `artifacts/research-match/.env.local`, then fill in the public URLs from the
   **same deployment**:

   ```dotenv
   VITE_CONVEX_URL=https://your-deployment.convex.cloud
   VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
   ```

4. Restart Vite, create an account, select an account type, and verify sign-out,
   sign-in, and access to `/app` with that deployment.

Only public URLs belong in `VITE_` variables. Never put `BETTER_AUTH_SECRET` or
`CONVEX_DEPLOY_KEY` there. `.env.local` files are ignored by Git.

The integration follows the [official Convex + Better Auth React guide](https://labs.convex.dev/better-auth/framework-guides/react).
See [backend setup and matching rules](artifacts/api-server/convex/README.md).

## Authentication and data boundaries

- Better Auth manages email/password accounts and sessions in its Convex
  component. Signup passwords must be 12–256 characters. Backend rate limiting
  uses database storage.
- Private routes wait for Convex to validate the Better Auth session before
  loading account queries. Profile reads/writes derive the owner from the
  validated session; clients cannot supply another account's id.
- Name and student/faculty preference are stored in the `accountProfiles` table.
  A self-selected faculty preference does not verify a faculty identity.
- Email verification and password-reset delivery are not configured. Do not
  treat an email address as verified USC affiliation.
- Research projects, saved opportunities, interests, resume text, and demo
  matching remain browser-local. Each signed-in account gets separate local
  state; it does not inherit the fictional demo student's profile. Authentication
  does not sync or migrate this workspace data into Convex.
- Existing vector matching actions remain internal until verified faculty
  access, project ownership, real data, and an embedding provider are connected.

## Checks and CI/CD

```sh
pnpm run typecheck
pnpm run typecheck:convex
pnpm test
pnpm --filter @workspace/research-match build
pnpm run analyze --base origin/main
```

[Fallow](https://github.com/fallow-rs/fallow) is pinned in the lockfile and used
by `.github/workflows/ci.yml`. Pull requests and pushes to `main` run TypeScript
checks, authentication-validation tests, the web build, and Fallow's changed-code
quality gate. Fallow reports dead code, complexity, duplication, and styling
findings; its audit blocks new failures while retaining inherited findings and
advisories in the report.

CI uploads the static frontend build as `researchmatch-web` and Fallow reports
as `fallow-analysis`. Deployment of the frontend needs a hosting destination with
SPA fallback to `index.html`; no frontend host is configured in this repository.

Convex's `artifacts/api-server/convex/_generated/` files are checked into Git so
CI can typecheck and run tests without deployment credentials. After changing
Convex functions or the schema, regenerate them with
`pnpm --filter @workspace/api-server exec convex codegen` and include any generated
changes in the same commit. Running `convex dev` also updates these files.

For backend CD, `.github/workflows/deploy-convex.yml` is manually dispatched on
`main`, reruns CI, then deploys Convex through the `production` GitHub environment.
Before running it:

- Add the production environment secret `CONVEX_DEPLOY_KEY`.
- Configure `BETTER_AUTH_SECRET` and the exact production `SITE_URL` on that
  Convex deployment.
- Set repository variables `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` for the
  intended frontend build. Leave both blank for a demo-only build.
- Configure the GitHub environment's approval rules as appropriate for the team.

The existing minimum package-release age is preserved. Build permissions use
pnpm 11's `allowBuilds`; native dependencies support macOS development and Linux CI.

## Verification status

The workspace and Convex TypeScript checks, authentication-validation tests,
production web build, and Fallow audit have been run locally. Fallow currently
returns advisory warnings. Live account flows and deployment remain unverified
until Convex credentials are configured. No browser connection was available
for interactive visual verification in this session.

## Project structure

- `artifacts/research-match`: React/Vite frontend.
- `artifacts/api-server`: Express status API and Convex functions.
- `lib/api-spec/openapi.yaml`: shared API contract. Run
  `pnpm --filter @workspace/api-spec codegen` after changing it.
- `AGENTS.md`: full ResearchMatch project brief and repository instructions.
- `docs/DATA_CONTRACT.md`: data contracts and source-of-truth rules.

The source repository is [MikeLuu99/research-match-hacksc](https://github.com/MikeLuu99/research-match-hacksc).
Changes are local until explicitly committed and pushed. Never commit private
student data, raw resumes, `.env.local`, or deployment keys.

## Professor workspace: demo vs live

Faculty routes: `/faculty` (lab workspace), `/faculty/discover`, `/faculty/shortlist`, `/faculty/inbox`, `/faculty/profile`, under both `/demo` and `/app`.

- **Demo (`/demo`, signed out):** all students, applicants and projects are fictional and stored in this browser. Demo students' email and résumé are shown only when that student's separate `shareContact` / `shareResume` flag is on (both default to off; the sample student can toggle them on the demo profile page).
- **Signed-in faculty (`/app`):** Discover uses the live, consented `users.listStudents` query, schedule view and AI ranking (server consent enforcement unchanged). Projects, shortlists, inbox and faculty profile are **browser-local** to the account (`researchmatch.demo.v2.account.<id>`); they are not synced, published or delivered, and students are not notified. Shortlists store only source-tagged IDs (`live:<id>` / `demo:<id>`), never student profile objects; details are re-read from the current live query, and students who opt out show as "Not currently shared".
- **Privacy limitation:** the faculty API exposes no student email or résumé, so live profiles always show these as "Not shared. Not available from the current faculty API." Live student interest is not yet delivered to faculty inboxes.
