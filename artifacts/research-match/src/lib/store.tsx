import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ALEX, SEED_PROJECTS, type Project, type StudentProfile } from "./data";
import { USC_PROJECTS } from "./usc-projects";

export type InterestStatus =
  | "interested"
  | "contacted"
  | "conversation"
  | "accepted"
  | "declined"
  | "withdrawn";

export interface Interest {
  id: string;
  projectId: string;
  studentId: string;
  studentName: string;
  status: InterestStatus;
  message: string;
  createdAt: string;
  updatedAt: string;
}

/** Browser-local faculty profile, kept separate from the student profile. */
export interface FacultyProfile {
  name: string;
  title: string;
  department: string;
  lab: string;
  email: string;
  office: string;
  officeHours: string;
  researchAreas: string[];
  about: string;
  mentoring: string;
  accepting: boolean;
}

const DEFAULT_FACULTY: FacultyProfile = {
  name: "Dr. Imani Okafor (fictional)",
  title: "Associate Professor",
  department: "Preventive Medicine",
  lab: "Sentinel Health Signals Lab (demo)",
  email: "",
  office: "",
  officeHours: "",
  researchAreas: ["clinical prediction", "fairness", "kidney disease"],
  about:
    "Fictional sample faculty profile. Studies early disease signals in routine bloodwork.",
  mentoring: "",
  accepting: true,
};

/**
 * Shortlist entries are source-tagged so fictional demo students and live
 * (consented, server-listed) students can never collide: "demo:<id>" or
 * "live:<id>". Only IDs are stored, never student profile objects.
 */
export type ShortlistSource = "demo" | "live";
export const shortlistKey = (source: ShortlistSource, id: string) =>
  `${source}:${id}`;
export function parseShortlistKey(key: string): {
  source: ShortlistSource;
  id: string;
} {
  const i = key.indexOf(":");
  const source = key.slice(0, i);
  if (i > 0 && (source === "demo" || source === "live"))
    return { source, id: key.slice(i + 1) };
  return { source: "demo", id: key };
}

interface State {
  profile: StudentProfile;
  projects: Project[];
  saved: string[];
  interests: Interest[];
  templates: Record<string, string>;
  /** projectId -> source-tagged student keys (see shortlistKey). */
  shortlists: Record<string, string[]>;
  faculty: FacultyProfile;
}

const KEY = "researchmatch.demo.v2";

const initial = (): State => ({
  profile: ALEX,
  projects: USC_PROJECTS.length ? USC_PROJECTS : SEED_PROJECTS,
  saved: ["usc-role-075"],
  interests: [
    {
      id: "i-seed-diego",
      projectId: "usc-role-065",
      studentId: "s-diego",
      studentName: "Diego Valcourt",
      status: "interested",
      message: "Fictional demo request.",
      createdAt: "2025-02-11T17:20:00.000Z",
      updatedAt: "2025-02-11T17:20:00.000Z",
    },
  ],
  templates: {},
  shortlists: {},
  faculty: DEFAULT_FACULTY,
});

function freshState(accountId?: string, accountName?: string): State {
  if (!accountId) return initial();
  return {
    ...initial(),
    profile: {
      id: accountId,
      name: accountName ?? "Researcher",
      major: "",
      year: "",
      skills: [],
      interests: [],
      hours: 0,
      wantsCredit: false,
      wantsPaid: false,
      bio: "",
      resumeText: "",
      visible: false,
      email: "",
      shareContact: false,
      shareResume: false,
    },
    saved: [],
    interests: [],
    templates: {},
    shortlists: {},
    // Signed-in faculty start from a blank profile, never the fictional one.
    faculty: {
      ...DEFAULT_FACULTY,
      name: accountName ?? "",
      department: "",
      lab: "",
      researchAreas: [],
      about: "",
    },
  };
}

function load(key: string, accountId?: string, accountName?: string): State {
  const state = freshState(accountId, accountName);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const stored = JSON.parse(raw) as Partial<State>;
      // A stale blob can carry an empty catalog (saved before the USC seed
      // existed); refill from the generated dataset so discovery works.
      if (!stored.projects?.length) stored.projects = state.projects;
      // Additive migration: older v2 blobs lack shortlists, faculty and the
      // demo consent flags. Fill defaults without touching existing fields.
      return {
        ...state,
        ...stored,
        profile: {
          email: "",
          shareContact: false,
          shareResume: false,
          ...(stored.profile ?? state.profile),
        },
        shortlists:
          stored.shortlists && typeof stored.shortlists === "object"
            ? stored.shortlists
            : {},
        faculty: { ...state.faculty, ...(stored.faculty ?? {}) },
      };
    }
  } catch {
    /* Fall back to a clean profile if storage is unavailable or invalid. */
  }
  return state;
}

interface Ctx extends State {
  updateProfile: (p: Partial<StudentProfile>) => void;
  toggleSave: (id: string) => void;
  expressInterest: (projectId: string, message: string) => void;
  setInterestStatus: (id: string, status: InterestStatus) => void;
  removeInterest: (id: string) => void;
  upsertProject: (p: Project) => void;
  removeProject: (id: string) => void;
  setTemplate: (projectId: string, text: string | null) => void;
  toggleShortlist: (projectId: string, key: string) => void;
  updateFaculty: (p: Partial<FacultyProfile>) => void;
  reset: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({
  children,
  accountId,
  accountName,
}: {
  children: ReactNode;
  accountId?: string;
  accountName?: string;
}) {
  const key = accountId ? `${KEY}.account.${accountId}` : KEY;
  const [state, setState] = useState<State>(() =>
    load(key, accountId, accountName),
  );
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* A blocked/full browser store must not crash the workspace. */
    }
  }, [key, state]);

  const now = () => new Date().toISOString();
  const value: Ctx = {
    ...state,
    updateProfile: (p) =>
      setState((s) => ({ ...s, profile: { ...s.profile, ...p } })),
    toggleSave: (id) =>
      setState((s) => ({
        ...s,
        saved: s.saved.includes(id)
          ? s.saved.filter((x) => x !== id)
          : [...s.saved, id],
      })),
    expressInterest: (projectId, message) =>
      setState((s) => {
        if (
          s.projects.find((project) => project.id === projectId)?.status !==
          "open"
        )
          return s;
        const existing = s.interests.find(
          (i) => i.projectId === projectId && i.studentId === s.profile.id,
        );
        if (existing)
          return {
            ...s,
            interests: s.interests.map((i) =>
              i.id === existing.id
                ? { ...i, status: "interested", message, updatedAt: now() }
                : i,
            ),
          };
        return {
          ...s,
          interests: [
            {
              id: "i-" + Date.now(),
              projectId,
              studentId: s.profile.id,
              studentName: s.profile.name,
              status: "interested",
              message,
              createdAt: now(),
              updatedAt: now(),
            },
            ...s.interests,
          ],
        };
      }),
    setInterestStatus: (id, status) =>
      setState((s) => ({
        ...s,
        interests: s.interests.map((i) =>
          i.id === id ? { ...i, status, updatedAt: now() } : i,
        ),
      })),
    removeInterest: (id) =>
      setState((s) => ({
        ...s,
        interests: s.interests.filter((i) => i.id !== id),
      })),
    upsertProject: (p) =>
      setState((s) => ({
        ...s,
        projects: s.projects.some((x) => x.id === p.id)
          ? s.projects.map((x) => (x.id === p.id ? p : x))
          : [p, ...s.projects],
      })),
    removeProject: (id) =>
      setState((s) => ({
        ...s,
        projects: s.projects.filter((x) => x.id !== id),
        shortlists: Object.fromEntries(
          Object.entries(s.shortlists).filter(([k]) => k !== id),
        ),
        saved: s.saved.filter((x) => x !== id),
        interests: s.interests.filter((i) => i.projectId !== id),
      })),
    setTemplate: (projectId, text) =>
      setState((s) => {
        const t = { ...s.templates };
        if (text === null) delete t[projectId];
        else t[projectId] = text;
        return { ...s, templates: t };
      }),
    toggleShortlist: (projectId, key) =>
      setState((s) => {
        const cur = s.shortlists[projectId] ?? [];
        return {
          ...s,
          shortlists: {
            ...s.shortlists,
            [projectId]: cur.includes(key)
              ? cur.filter((x) => x !== key)
              : [...cur, key],
          },
        };
      }),
    updateFaculty: (p) =>
      setState((s) => ({ ...s, faculty: { ...s.faculty, ...p } })),
    reset: () => {
      try { localStorage.removeItem(key); } catch { /* Storage may be disabled. */ }
      setState(freshState(accountId, accountName));
    },
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

export const STATUS_LABEL: Record<InterestStatus, string> = {
  interested: "Interest sent",
  contacted: "Emailed PI",
  conversation: "In conversation",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};
