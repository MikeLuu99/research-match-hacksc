# ResearchMatch data and source-of-truth rules

## Current sample

All people, projects, recruitment statuses and scores shown by the app are
fictional sample data. Browser-local profile edits, saves, interest requests
and faculty edits are not shared between browsers or stored in Convex.
Do not enter real resumes or sensitive student data in this unauthenticated demo.

## Source of truth

The GitHub repository [research-match-hacksc](https://github.com/MikeLuu99/research-match-hacksc) holds application code, schemas,
matching rules, documentation and explicitly non-sensitive sample fixtures.
The user created this repository; it is currently public. Repository writes use
the project's regular Git connection.
An initial code push is not automatic continuous synchronization.

Convex will be the operational source for authorized listings, consented student
profiles and application state after connection and authentication are built.
GitHub must **not** contain resumes, student records, secrets or embeddings from
private student data.

## Project import fields

| Field | Meaning |
| --- | --- |
| sourceId | Stable upstream ID, used to deduplicate/upsert |
| title, description | Research work and responsibilities |
| department, faculty | Authorized research team and owning school |
| requiredSkills | Hard requirements; do not silently waive |
| preferredSkills | Learnable preferences, not exclusion criteria |
| hoursPerWeek | Minimum required weekly availability |
| offersCredit | Whether credit is offered, subject to curriculum approval |
| beginnerFriendly | Mentorship/learning support, not a waiver of hard criteria |
| recruitmentStatus | `open`, `closed`, or `explore` |
| sourceUrl | Evidence URL where available |
| verifiedAt | Last actual recruitment verification, not scrape time |
| embeddingModel, embedding | Server-generated compatible model/vector |

Only `open` listings accept interest. Public lab descriptions default to
`explore` unless recruitment has been independently verified. Academic credit
offered by a project does not establish curriculum eligibility for a student.
Start with a validated import preview before making records visible.

## Student requirements for the live system

Student profiles are private by default. Faculty discovery requires explicit
opt-in consent. Real account identity and ownership must be enforced server-side.
Resumes require private file storage, access rules, deletion policy and verified
parsing before they are accepted by a live service.

## Matching

The sample uses local lexical text vectors and eligibility checks, **not an LLM
or live semantic embeddings**. The future Convex path uses model embeddings,
vector retrieval and explicit checks for skills, availability and credit.
Similarity is not a hiring probability or proof of eligibility.
Beginner-friendliness and transferable skills should affect recommendations,
without presenting missing mandatory qualifications as satisfied.
