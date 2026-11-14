import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ALEX, SEED_PROJECTS, type Project, type StudentProfile } from "./data";

export type InterestStatus = "interested" | "contacted" | "conversation" | "accepted" | "declined" | "withdrawn";

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

interface State {
  profile: StudentProfile;
  projects: Project[];
  saved: string[];
  interests: Interest[];
  templates: Record<string, string>;
}

const KEY = "researchmatch.demo.v1";

const initial = (): State => ({
  profile: ALEX,
  projects: SEED_PROJECTS,
  saved: ["p-wearable"],
  interests: [
    {
      id: "i-seed-diego",
      projectId: "p-triage",
      studentId: "s-diego",
      studentName: "Diego Valcourt",
      status: "interested",
      message: "Fictional demo request.",
      createdAt: "2025-02-11T17:20:00.000Z",
      updatedAt: "2025-02-11T17:20:00.000Z",
    },
  ],
  templates: {},
});

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial(), ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return initial();
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
  reset: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const now = () => new Date().toISOString();
  const value: Ctx = {
    ...state,
    updateProfile: (p) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } })),
    toggleSave: (id) =>
      setState((s) => ({ ...s, saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id] })),
    expressInterest: (projectId, message) =>
      setState((s) => {
        if (s.projects.find((project) => project.id === projectId)?.status !== "open") return s;
        const existing = s.interests.find((i) => i.projectId === projectId && i.studentId === s.profile.id);
        if (existing)
          return {
            ...s,
            interests: s.interests.map((i) => (i.id === existing.id ? { ...i, status: "interested", message, updatedAt: now() } : i)),
          };
        return {
          ...s,
          interests: [
            { id: "i-" + Date.now(), projectId, studentId: s.profile.id, studentName: s.profile.name, status: "interested", message, createdAt: now(), updatedAt: now() },
            ...s.interests,
          ],
        };
      }),
    setInterestStatus: (id, status) =>
      setState((s) => ({ ...s, interests: s.interests.map((i) => (i.id === id ? { ...i, status, updatedAt: now() } : i)) })),
    removeInterest: (id) => setState((s) => ({ ...s, interests: s.interests.filter((i) => i.id !== id) })),
    upsertProject: (p) =>
      setState((s) => ({
        ...s,
        projects: s.projects.some((x) => x.id === p.id) ? s.projects.map((x) => (x.id === p.id ? p : x)) : [p, ...s.projects],
      })),
    removeProject: (id) =>
      setState((s) => ({
        ...s,
        projects: s.projects.filter((x) => x.id !== id),
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
    reset: () => setState(initial()),
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
