# ResearchMatch — AI-Powered Research Matching at USC

**Vision:** Connect USC students with suitable research projects across all departments while helping professors efficiently discover and recruit qualified student researchers.

## 1. Problem Statement

### For Students

- **Fragmented opportunities:** Research projects are scattered across department websites, faculty pages, Handshake, emails, and personal networks.
- **Difficult discovery:** Students often don't know which professors are recruiting or which projects match their interests.
- **Unclear qualifications:** Students struggle to assess whether they have the necessary skills and experience.
- **Limited connections:** Students without existing faculty relationships may miss valuable opportunities.
- **Interdisciplinary barriers:** Students rarely discover relevant research outside their own departments.

### For Professors

- **Recruitment difficulties:** Finding students with appropriate skills, interests, and availability can be time-consuming.
- **Limited visibility:** Opportunities may only reach students within a professor's department or existing network.
- **Inefficient screening:** Reviewing applications and identifying suitable candidates takes time.
- **Missed talent:** Qualified students from other departments may never discover the project.

## 2. Objectives

- Centralize research opportunities across all USC schools and departments.
- Enable bidirectional AI matching: match students with research projects and professors with suitable students.
- Improve accessibility: help students discover opportunities regardless of major, experience, or existing connections.
- Simplify recruitment: reduce the effort required to advertise projects, discover candidates, and manage applications.
- Support student development: help students understand qualifications, prepare applications, and identify skills to develop.

## 3. Target Users

| Users                       | Primary Needs                                                     |
| --------------------------- | ----------------------------------------------------------------- |
| Undergraduate students      | Find research opportunities, including beginner-friendly projects |
| Graduate students           | Discover specialized research opportunities and collaborations    |
| Professors / PIs            | Recruit students with relevant skills and interests               |
| PhD students / Lab managers | Find research assistants and coordinate recruitment               |
| USC research programs       | Improve research opportunity visibility and student participation |

## 4. Proposed Solution & Key Features

### Student Side

- **AI Profile Builder:** Upload a resume and specify skills, coursework, research interests, goals, and availability.
- **Personalized Research Matching:** Receive recommended projects across USC departments.
- **Explainable Match Scores:** Understand why a project is suitable and which qualifications may be missing.
- **Matching factors:** Experience on the resume, academic major, academic credit based on the student's curriculum, and time availability.
- **Research Discovery:** Browse professors, labs, and research projects with filters.
- **AI Outreach Assistant:** Generate personalized emails, application drafts, and suggested questions for professors.
- **Application Tracking:** Save opportunities and track applications.

### Professor Side

- **Research Project Posting:** Describe a project, responsibilities, requirements, and recruitment status.
- **AI Student Matching:** Discover suitable students based on qualifications, interests, and availability.
- **Candidate Recommendations:** Review student profiles with explanations of their relevant experience.
- **Recruitment Assistance:** Draft outreach messages and organize interested applicants.

### Potential Future Features

- Research paper summaries and preparation guides.
- Skill-gap analysis with recommended learning resources.
- Alerts for newly available research opportunities.
- Faculty-student mentoring recommendations.
- Interdisciplinary research team formation.

## 5. User Journeys

### Student Journey

1. **Sign up:** Upload a resume and select research interests, goals, and availability.
2. **Discover:** AI recommends research projects that match the student's profile.
3. **Explore:** View project descriptions, requirements, faculty members, and match explanations.
4. **Prepare:** AI helps explain the research and draft personalized outreach.
5. **Connect:** Express interest or apply through the appropriate channel.
6. **Track:** Monitor applications and receive relevant opportunity updates.

### Professor Journey

1. **Sign up:** Create a faculty or research team profile.
2. **Post:** Describe research projects, required skills, and available positions.
3. **Match:** AI recommends interested, suitable students who have opted into recruitment.
4. **Review:** Compare candidate qualifications and matching explanations.
5. **Connect:** Invite promising students to discuss projects or apply.
6. **Recruit:** Manage applications and select research assistants.

## 6. Data Requirements

| Data                                            | Sources                                         |
| ----------------------------------------------- | ----------------------------------------------- |
| Student backgrounds, skills, interests, resumes | Student-submitted profiles                      |
| Research project descriptions and requirements  | Professors and authorized research teams        |
| Faculty profiles and research interests         | Public USC department and faculty websites      |
| Research publications and topics                | Public academic publications and lab websites   |
| Research openings and availability              | Verified faculty postings and research programs |
| Matching preferences and feedback               | Student and professor interactions              |

**Important:** Distinguish between professors conducting research and projects actively recruiting students. Public lab descriptions do not necessarily indicate open positions.

## 7. AI Applications

| AI Capability              | Purpose                                                             |
| -------------------------- | ------------------------------------------------------------------- |
| Resume and project parsing | Extract skills, experience, interests, and requirements             |
| Semantic matching          | Identify relevant projects and candidates beyond keyword similarity |
| Eligibility checking       | Distinguish mandatory requirements from preferred qualifications    |
| Match explanations         | Explain compatibility, strengths, and missing skills                |
| Research summarization     | Make unfamiliar research topics easier to understand                |
| Outreach personalization   | Help students and professors prepare relevant messages              |
| Recommendation improvement | Use feedback to improve future matching                             |

Matching should consider both current qualifications and potential to learn, so beginners are not automatically excluded from suitable projects.

## 8. Key Challenges and Considerations

| Challenge                                                           | Proposed Approach                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Cold start: Few professors or students initially participate        | Begin with public research information and a small group of verified faculty listings |
| Data freshness: Research openings frequently change                 | Require recruitment status and periodic verification                                  |
| Matching accuracy: AI may recommend unsuitable candidates           | Use eligibility checks and evidence-backed explanations                               |
| Privacy: Student resumes contain personal information               | Make profiles private by default and require consent for professor visibility         |
| Fairness: Students with less experience may be disadvantaged        | Include beginner-friendly opportunities and transferable skills                       |
| Professor adoption: Faculty may not want another platform to manage | Make project posting and candidate review quick and simple                            |
| Existing alternatives: USC has research discovery programs          | Differentiate through cross-department, bidirectional matching                        |
| Marketplace imbalance: One side may grow faster than the other      | Prioritize student discovery while gradually recruiting faculty                       |

## 9. Hackathon MVP

**Goal:** Demonstrate that ResearchMatch can intelligently connect students and research projects in both directions.

### Must-Have Features

- Student onboarding with resume upload and research preferences.
- Professor project creation with requirements and responsibilities.
- AI recommendations for both students and professors.
- Explainable match results showing strengths and qualification gaps.
- Simple student–professor connection or interest-request workflow.

### Demo Scenario

A computer science student interested in healthcare uploads their resume. ResearchMatch recommends a biomedical research project outside their department, explaining how their programming and machine-learning skills apply.

The professor then opens their dashboard and discovers the same student as a recommended candidate, with an explanation of their qualifications.

**Key differentiator:** The platform enables cross-department discovery and recruitment, not just professor searches.

## 10. Success Metrics

- Number of participating students and research teams.
- Percentage of recommendations considered relevant.
- Time saved searching for opportunities or screening candidates.
- Number of student–professor connections.
- Number of applications, interviews, and successful research placements.
- Number of interdisciplinary matches.
- Student and faculty satisfaction.

## 11. Potential USC Adoption

**Possible partners:** USC Student Government, research offices, undergraduate research programs, Trojan Research Association, and individual departments.

**Initial rollout:** Pilot with a limited number of professors and students across multiple departments, collect matching feedback, and expand based on demonstrated results.

## 12. Open Questions for the Team

- Should we focus on actively recruiting projects only, or also let students explore professors who are not currently recruiting?
- Should matching prioritize research interests, existing skills, or learning potential?
- How can we recruit enough professors to make the two-sided platform valuable?
- Should students apply directly through ResearchMatch or use existing application systems?
- How can we distinguish ourselves from USC's existing research discovery platforms?
- How do we demonstrate that our AI matching performs better than traditional keyword search?

## One-Sentence Pitch

ResearchMatch is an AI-powered, two-sided platform that connects USC students with relevant research projects across departments while helping professors discover and recruit suitable student researchers.

## Differentiation

### Why not Handshake or another job posting website?

ResearchMatch is more customized to students' syllabi, schedules, and academic credits.

### Why not cold-email?

- Cold-emailing has a low response rate.
- Outreach to the wrong labs or candidates can waste time for both students and professors.

## Repository Implementation Notes

- This repository is a pnpm workspace. The React/Vite app is in `artifacts/research-match`; the Express API and Convex functions are in `artifacts/api-server`.
- Shared API contracts live in `lib/api-spec/openapi.yaml`. Regenerate clients after changing that contract.
- Implemented locally: a public landing page, sign-up/sign-in with Better Auth, student/faculty onboarding, a signed-in prototype workspace, and Fallow static analysis in GitHub Actions.
- Use Better Auth with the Convex adapter for account sessions. Convex credentials and deployment configuration are pending; do not claim live authentication until a real deployment has been configured and verified.
- Account types identify student and faculty workflows. Self-selected faculty status does not establish verified faculty identity or grant access to private research data.
- Existing research projects, profile matching, and recruitment workflows are fictional browser-local demo data. Authentication does not migrate that data into Convex.
- Keep a public demo accessible without an account. Distinguish the public demo from signed-in account access.
- Fallow is the requested static-analysis tool: https://github.com/fallow-rs/fallow. Use its GitHub Action in CI along with TypeScript checks, authentication-validation tests, and a production build. Fallow itself is not a deployment host.
- Deployment destination is not configured. Do not describe build artifacts as a deployed website.
- Use `.env.local` for local credentials and GitHub Actions secrets for deployment keys. Never commit credentials, private student information, or resume contents.
- Preserve `minimumReleaseAge` in `pnpm-workspace.yaml`. Support local macOS development as well as Linux CI.
- Before reporting completion, run the available checks and clearly distinguish passing checks from checks blocked by network access or missing credentials.

## Current Verification and Activation

- Workspace TypeScript, Convex TypeScript, authentication-validation tests, the production web build, and the Fallow audit have been run locally. Fallow has advisory warnings.
- Live Better Auth account flows require the frontend public Convex URLs and deployment-side `BETTER_AUTH_SECRET` and `SITE_URL`. These credentials are pending.
- GitHub Actions builds frontend artifacts. The manually dispatched Convex deployment workflow requires the production environment deploy key. No frontend hosting destination is configured.
- Interactive browser verification was unavailable in this session. Do not describe untested live authentication or deployment as verified.

## Background Jobs and Offline Demo

- AI jobs that accept an account or record ID (`chat.answer`, `users.embedStudent`, and `faculty.embedProject`) are internal actions. Schedule them from authenticated mutations; do not expose them as public endpoints.
- Optional-backend UI components import query/mutation/action hooks from `src/lib/backend.ts`. The authentication provider uses Convex's native hooks. Preserve the demo's ability to render without Convex environment variables.
- Project details and catalog cards share `InterestButton` for live interest submission. Re-sending an active request must preserve faculty decisions; only withdrawn requests may be reopened by students.
- Empty AI results may initiate catalog setup once per mounted signed-in student view. Avoid making setup state a dependency that retriggers its own effect.
- Bookmarks use `sourceId ?? id` across catalog cards, project details, AI/chat cards, and Saved. Normalize older document-ID bookmarks when the live catalog arrives, preserving unknown IDs until their listings load.
- Every displayed compatibility percentage (AI recommendation rows, Discover cards, Saved, project details) comes from one backend hybrid ranking (`discovery:projectScores` / `discovery:demoProjectScores`: 65% vector similarity + 35% BM25, normalized over the full catalog) so the numbers stay comparable; the browser-local matcher (`src/lib/matching.ts`) is the offline-demo fallback and still supplies strengths, gaps, and eligibility explanations. ProjectDialog matches against `useMatchProfile()` (the live student profile), never the raw browser-local profile.
- The API test command also runs web route regressions in Node: offline rendering, legacy bookmarks, and nested workspace navigation. These render checks do not verify browser interaction or live OAuth.
