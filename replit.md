# ResearchMatch

Independent USC research-matching sample with fictional opportunities, browser-local persistence and Convex vector-search groundwork.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/research-match run dev` — web sample; start through its managed workflow
- `pnpm --filter @workspace/api-server exec tsc -p convex/tsconfig.json` — check Convex groundwork
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/research-match/src` — demo UI, fictional fixtures, local matching and persistence
- `artifacts/api-server/convex` — schema and internal vector-search functions, not deployed
- `lib/api-spec/openapi.yaml` — status API contract
- `docs/DATA_CONTRACT.md` — live-data requirements and source-of-truth boundaries

## Architecture decisions

- Keep the demo usable before actual research data is provided; do not imply fictional openings are verified.
- GitHub is intended for code, rules and schemas, never private resumes or student data.
- Keep Convex matching internal until live authentication, faculty authorization and an embedding provider are implemented.

## Product

Students explore and save projects, edit profiles, view explained matches and track local interest requests. Faculty manage sample projects and discover opted-in fictional candidates.

## User preferences

The user will provide real data later and requested vector-database matching, a GitHub source-of-truth repository and a Convex connection check.
Do not deploy to production (Cloudflare Pages or the Convex production deployment) without the user's explicit approval. Local dev pushes (`convex dev --once` to the dev deployment) are fine.

## Gotchas

- Configuration alone is not a verified connection. Do not mark Convex connected until a live query succeeds.
- Code repository: https://github.com/MikeLuu99/research-match-hacksc (currently public). Commit and push changes explicitly; no automatic ongoing sync is configured.
- The sample is unauthenticated. Never enter or import real student records until privacy controls exist.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
