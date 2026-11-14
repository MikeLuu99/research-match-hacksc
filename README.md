# ResearchMatch

A working browser-local sample for USC cross-department research discovery and
faculty recruitment. This is an independent prototype, not an official USC
service. The user will supply actual research data later.

## Included

- Student research discovery, profile/preferences and explainable demo matches.
- Saved opportunities and local interest tracking.
- Faculty project management and consent-aware candidate discovery.
- A status page that distinguishes configuration from actual connectivity.
- Convex schema and internal vector-search groundwork for both directions.

## Run

Use the managed web and API workflows in this project.

```sh
pnpm install
pnpm --filter @workspace/api-spec run codegen
pnpm run typecheck
```

The web artifact is `artifacts/research-match`. The shared status API is
`/api/researchmatch/status`. Shared API contracts live in
`lib/api-spec/openapi.yaml`; regenerate clients after changing the contract.

## Integration status

**Convex:** No deployment URL or connection was configured. The browser app
continues to use localStorage, not Convex. See
[Convex setup](artifacts/api-server/convex/README.md).

**GitHub:** [MikeLuu99/research-match-hacksc](https://github.com/MikeLuu99/research-match-hacksc)
is the source-of-truth repository for project code, schemas and matching rules.
It is currently public. Keep private student data out of this repository.
Changes must be explicitly committed and pushed; there is no automatic ongoing sync.

See [data contracts and source-of-truth rules](docs/DATA_CONTRACT.md). Do not
commit private student data, `.env` files or deployment keys.

## Scope

No production authentication, live resume parsing, AI-generated outreach,
embedding generation or external email delivery is claimed. Local outreach
drafts are templates. Real account roles, private storage and a verified data
import are required before use with actual student information.
