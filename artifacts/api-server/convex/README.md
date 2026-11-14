# Convex groundwork — not deployed

These files define real Convex tables and cosine-similarity vector indexes for
both directions of ResearchMatch discovery. They are **not connected to the
sample browser application**. No live Convex connection was available when the
sample was created.

## Before enabling

1. Associate this API package with your Convex project using
   `pnpm --filter @workspace/api-server exec convex dev`.
   Complete Convex's account/deployment authorization. Do not paste credentials
   into source files, chat, or GitHub.
2. Deploy this schema. The package-root `convex/` folder is the Convex default.
3. Call the safe `matching:health` query through that deployment and confirm the
   returned service/schema version before claiming a live connection.
4. Connect an embedding provider. Both query and stored vectors must use the
   **same model, version, and 1536 dimensions**. Store the model identifier.
   A provider change requires re-embedding all records.
5. Add authenticated profile ownership and verified-faculty authorization before
   adding public matching actions, writes, or imports. Matching actions are
   intentionally internal until those controls exist.
6. Build validated, authorized import/upsert functions using `sourceId`, and
   supply the real project records. No production data is seeded automatically.
7. Replace local demo persistence with authenticated Convex reads/writes. Setting
   a URL alone does **not** activate this integration or migrate browser data.

## Matching behavior

- Projects are pre-filtered to actively recruiting openings.
- Reverse matching is pre-filtered to explicit student consent, checked again
  after document retrieval.
- Required skills, availability and academic-credit eligibility are separate
  from vector similarity. Learning potential does not waive hard requirements.
- Results with an unexpected embedding model are excluded.
- The retrieval candidate set is bounded to 64; it is approximate, not exhaustive.
- Raw resumes, private identifiers, and embeddings are never returned to faculty.
- Verification timestamps describe actual verification, not ingestion time.

Official reference: https://docs.convex.dev/search/vector-search
