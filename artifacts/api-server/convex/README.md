# Convex backend and Better Auth

This directory contains the Better Auth integration, private account onboarding,
and internal research-matching groundwork. A live Convex deployment has not been
configured or verified yet.

## Authentication setup

From the repository root:

```sh
pnpm --filter @workspace/api-server exec convex dev
pnpm --filter @workspace/api-server exec convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
pnpm --filter @workspace/api-server exec convex env set SITE_URL http://localhost:5173
```

Keep the development command running after setup. Copy the deployment's public
`.convex.cloud` and `.convex.site` URLs into the frontend's
`artifacts/research-match/.env.local` as `VITE_CONVEX_URL` and
`VITE_CONVEX_SITE_URL`. The frontend and backend keep separate environment files;
setting variables only on Express does not configure the Convex deployment.

- `convex.config.ts` mounts the Better Auth component, which owns its auth tables.
- `auth.config.ts` configures Convex to accept Better Auth tokens.
- `auth.ts` configures email/password, trusted origins, cross-domain sessions,
  password lengths, and database-backed rate limiting.
- `http.ts` registers Better Auth routes and CORS using the lazy registration API.
- `users.ts` validates the session before reading or creating the caller's
  `accountProfiles` row. Account types are workflow preferences, not verified
  faculty authorizations.
- `model.ts` provides schema-derived typed function builders. Typed component
  references mirror the mount so CI can typecheck without deployment credentials;
  the normal `_generated` files are tracked for typed test API references and
  convex-test module discovery. Keep them in Git and include updates produced by
  `pnpm --filter @workspace/api-server exec convex codegen` or `convex dev`.

Email verification and password-reset delivery need a separately configured
email provider. They are not enabled in this prototype. No email is sent by the
current implementation.

Official setup: [Convex + Better Auth for React](https://labs.convex.dev/better-auth/framework-guides/react).

## Before enabling real research data

1. Verify sign-up, onboarding, sign-out, sign-in, and direct private-route access
   against the configured deployment.
2. Call the safe `matching:health` query and confirm the returned service and
   schema version.
3. Connect an embedding provider. Query and stored vectors must use the same
   model, version, and 1536 dimensions. A provider change requires re-embedding.
4. Add authenticated research-profile ownership, project ownership, and verified
   faculty authorization before exposing matching actions or research writes.
5. Build validated imports/upserts using `sourceId`, with real authorized data.
6. Replace browser-local research persistence with authenticated Convex reads
   and writes. Setting auth URLs alone does not sync research data or resumes.

## Matching behavior

- Matching actions remain internal while research authorization is incomplete.
- Project recommendations pre-filter for actively recruiting openings.
- Reverse matching pre-filters for explicit student consent and rechecks it
  after retrieval.
- Required skills, availability, and academic-credit eligibility are separate
  from semantic similarity. Learning potential does not waive hard requirements.
- Results using a different embedding model are excluded.
- The retrieval candidate set is bounded to 64 and is approximate.
- Raw resumes, private identifiers, and embeddings are not returned to faculty.
- Verification timestamps represent actual verification rather than ingestion.

Official reference: [Convex vector search](https://docs.convex.dev/search/vector-search).

## Production deployment

Set `BETTER_AUTH_SECRET` and the exact HTTPS `SITE_URL` on the production Convex
deployment. Add `CONVEX_DEPLOY_KEY` as a secret in GitHub's `production`
environment, then run the **Deploy Convex** workflow from `main`. It requires CI
checks, including Fallow, to finish successfully before deployment.

Never put secrets into source files, frontend `VITE_` variables, or Git commits.
