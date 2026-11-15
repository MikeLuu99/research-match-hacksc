import { useState } from "react";
import { Link } from "wouter";
import { Check, Circle, ListChecks, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex-api";

// Setup checklist for students: shows which profile steps are still missing
// and links to the editor. Disappears once everything is done (or dismissed
// for the session).
export function SetupChecklist() {
  const profile = useQuery(api.users.myStudentProfile, {});
  const [dismissed, setDismissed] = useState(false);

  if (profile === undefined || profile === null || dismissed) return null;

  const items: { label: string; done: boolean }[] = [
    { label: "Add your major and school year", done: Boolean(profile.major) },
    { label: "List your skills", done: (profile.skills ?? []).length > 0 },
    {
      label: "Add research interests",
      done: (profile.interests ?? []).length > 0,
    },
    { label: "Write a short bio", done: Boolean((profile.bio ?? "").trim()) },
    {
      label: "Set your weekly availability",
      done: Boolean((profile.schedule ?? "").trim()),
    },
    {
      label: "Upload your resume",
      done: Boolean(profile.resumeStorageId),
    },
    {
      label: "Opt in to faculty discovery",
      done: Boolean(profile.recruitmentConsent),
    },
  ];
  const remaining = items.filter((item) => !item.done);
  if (remaining.length === 0) return null;

  return (
    <div className="rise border border-primary/20 bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl">
          <ListChecks className="text-primary" size={20} />
          Finish setting up your account
        </h2>
        <button
          aria-label="Dismiss checklist"
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X size={17} />
        </button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {remaining.length} step{remaining.length === 1 ? "" : "s"} left — a
        complete profile gets better AI matches.
      </p>
      <ul className="mt-4 grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              to="~/app/profile"
              className="flex items-center gap-2.5 border border-primary/15 bg-background px-3 py-2.5 text-sm hover:border-primary/40"
            >
              {item.done ? (
                <Check size={16} className="text-chart-3" />
              ) : (
                <Circle size={16} className="text-primary/40" />
              )}
              <span className={item.done ? "text-muted-foreground line-through" : "font-medium"}>
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
