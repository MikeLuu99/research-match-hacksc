import { useEffect, useState } from "react";
import { useAction } from "./backend";
import { api } from "./convex-api";
import { useAccount } from "./auth";
import type { MatchResult } from "./matching";

// One compatibility percentage everywhere: when the backend is connected,
// catalog cards, Saved and project details reuse the exact hybrid ranking
// that powers the AI recommendation rows (65% vector similarity + 35% BM25,
// normalized over the full catalog). A null map means fall back to the
// browser-local demo matcher (offline demo, or profile embedding not ready).
export function useHybridScores(enabled = true): Map<string, number> | null {
  const account = useAccount();
  const realUser =
    account.isAuthenticated &&
    account.viewer?.accountType === "student" &&
    account.viewer.hasStudentProfile;
  const runScores = useAction(api.discovery.projectScores);
  const runDemo = useAction(api.discovery.demoProjectScores);
  const [scores, setScores] = useState<Map<string, number> | null>(null);
  const configured = account.isConfigured;

  useEffect(() => {
    if (!configured || !enabled) {
      setScores(null);
      return;
    }
    let cancelled = false;
    (realUser ? runScores({}) : runDemo({}))
      .then((result) => {
        if (cancelled) return;
        const ready = (result as { ready?: boolean } | null)?.ready === true;
        const list = (result as { scores?: { sourceId: string; similarity: number }[] } | null)?.scores ?? [];
        setScores(ready ? new Map(list.map((s) => [s.sourceId, s.similarity])) : null);
      })
      .catch(() => {
        if (!cancelled) setScores(null);
      });
    return () => {
      cancelled = true;
    };
  }, [configured, realUser, enabled, runScores, runDemo]);

  return configured && enabled ? scores : null;
}

// Overlay the backend hybrid score onto the local match result; the local
// matcher keeps providing strengths, gaps and eligibility explanations.
export function withHybridScore(
  m: MatchResult,
  key: string,
  scores: Map<string, number> | null,
): MatchResult {
  const hybrid = scores?.get(key);
  return hybrid == null ? m : { ...m, score: Math.round(hybrid * 1000) / 10 };
}
