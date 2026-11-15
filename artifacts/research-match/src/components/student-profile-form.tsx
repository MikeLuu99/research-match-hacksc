import { useState, type ChangeEvent, type FormEvent } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/lib/convex-api";
import { useAccount } from "@/lib/auth";

const SCHOOL_YEARS = [
  { value: "freshman", label: "Freshman" },
  { value: "sophomore", label: "Sophomore" },
  { value: "junior", label: "Junior" },
  { value: "senior", label: "Senior" },
  { value: "masters", label: "Master’s student" },
  { value: "phd", label: "PhD student" },
] as const;

const MAX_RESUME_BYTES = 8 * 1024 * 1024;

interface ExperienceEntry {
  role: string;
  org: string;
  description: string;
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function FieldLabel({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor: string;
  children: string;
  optional?: boolean;
}) {
  return (
    <span className="flex w-full items-baseline justify-between gap-2">
      <label htmlFor={htmlFor}>{children}</label>
      <span
        aria-hidden="true"
        className={
          optional
            ? "font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground"
            : "font-mono text-[9px] uppercase tracking-[0.12em] text-primary"
        }
      >
        {optional ? "Optional" : "Required"}
      </span>
    </span>
  );
}

export type StudentProfileInitial = {
  major: string;
  schoolYear: string;
  skills: string[];
  interests: string[];
  experience: ExperienceEntry[];
  hoursPerWeek: number;
  workStudy: boolean;
  seekingCredit: boolean;
  recruitmentConsent: boolean;
  resumeFileName?: string;
};

export function StudentProfileForm({
  initial,
  variant = "onboarding",
}: {
  initial?: StudentProfileInitial;
  variant?: "onboarding" | "editor";
}) {
  const account = useAccount();
  const upsertProfile = useMutation(api.users.upsertStudentProfile);
  const requestUploadUrl = useAction(api.users.generateResumeUploadUrl);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [experience, setExperience] = useState<ExperienceEntry[]>(
    initial?.experience ?? [],
  );
  const [resumeName, setResumeName] = useState(initial?.resumeFileName ?? "");

  function updateExperience(index: number, patch: Partial<ExperienceEntry>) {
    setExperience((entries) =>
      entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
  }

  function pickResume(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setResumeName("");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      event.target.value = "";
      setResumeName("");
      setError("Resume files are limited to 8 MB.");
      return;
    }
    setError("");
    setResumeName(file.name);
  }

  async function uploadResume(file: File) {
    const { url } = await requestUploadUrl({});
    const response = await fetch(url, {
      method: "POST",
      body: file,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    });
    if (!response.ok) throw new Error("Resume upload failed.");
    const { storageId } = (await response.json()) as { storageId: string };
    return storageId;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const resumeInput = event.currentTarget.elements.namedItem(
      "resume",
    ) as HTMLInputElement | null;
    const resumeFile = resumeInput?.files?.[0];
    const skills = splitTags(String(data.get("skills") ?? ""));
    const interests = splitTags(String(data.get("interests") ?? ""));
    if (skills.length === 0 && interests.length === 0) {
      setError("Add at least one skill or research interest to save your profile.");
      event.currentTarget
        .querySelector<HTMLElement>("#profile-skills")
        ?.focus();
      return;
    }
    setError("");
    setPending(true);
    try {
      const resumeStorageId = resumeFile ? await uploadResume(resumeFile) : undefined;
      await upsertProfile({
        major: String(data.get("major") ?? ""),
        schoolYear: String(data.get("school-year") ?? "freshman") as
          | "freshman"
          | "sophomore"
          | "junior"
          | "senior"
          | "masters"
          | "phd",
        skills,
        interests,
        experience,
        hoursPerWeek: Number(data.get("hours-per-week") ?? 0),
        workStudy: data.get("work-study") === "on",
        seekingCredit: data.get("seeking-credit") === "on",
        recruitmentConsent: data.get("recruitment-consent") === "on",
        resumeStorageId,
        resumeFileName: resumeStorageId ? resumeName || resumeFile?.name : undefined,
      });
      if (variant === "editor") {
        setSaved(true);
        setPending(false);
        return;
      }
      window.location.assign(
        `${window.location.origin}${import.meta.env.BASE_URL}app`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn’t save your profile. Please try again.",
      );
      setPending(false);
    }
  }

  return (
    <form className="auth-form profile-form" onSubmit={submit}>
      <div className="auth-field">
        <FieldLabel htmlFor="profile-major">Major</FieldLabel>
        <input
          id="profile-major"
          name="major"
          placeholder="Computer Science"
          maxLength={120}
          required
          disabled={pending}
          defaultValue={initial?.major ?? ""}
        />
      </div>
      <div className="auth-field">
        <FieldLabel htmlFor="profile-year">School year</FieldLabel>
        <select
          id="profile-year"
          name="school-year"
          required
          disabled={pending}
          defaultValue={initial?.schoolYear ?? "freshman"}
        >
          {SCHOOL_YEARS.map((year) => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>
      </div>
      <div className="auth-field">
        <FieldLabel htmlFor="profile-skills">Skills</FieldLabel>
        <input
          id="profile-skills"
          name="skills"
          placeholder="Python, React, machine learning"
          disabled={pending}
          defaultValue={initial?.skills.join(", ") ?? ""}
        />
        <p className="auth-help">Separate with commas — or list research interests below. At least one of the two is required.</p>
      </div>
      <div className="auth-field">
        <FieldLabel htmlFor="profile-interests" optional>Research interests</FieldLabel>
        <input
          id="profile-interests"
          name="interests"
          placeholder="healthcare, natural language processing"
          disabled={pending}
          defaultValue={initial?.interests.join(", ") ?? ""}
        />
        <p className="auth-help">Separate interests with commas.</p>
      </div>
      <fieldset disabled={pending} className="experience-section">
        <legend>Experience <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Optional</span></legend>
        {experience.length === 0 && (
          <p className="auth-help">
            Add roles, campus jobs, or projects. You can also skip this and
            attach a resume below.
          </p>
        )}
        {experience.map((entry, index) => (
          <div className="experience-entry" key={index}>
            <div className="experience-row">
              <input
                aria-label="Role"
                placeholder="Role (e.g. Course grader)"
                value={entry.role}
                maxLength={80}
                onChange={(e) => updateExperience(index, { role: e.target.value })}
              />
              <input
                aria-label="Organization"
                placeholder="Organization"
                value={entry.org}
                maxLength={80}
                onChange={(e) => updateExperience(index, { org: e.target.value })}
              />
            </div>
            <textarea
              aria-label="Description"
              placeholder="What did you do?"
              value={entry.description}
              maxLength={600}
              onChange={(e) =>
                updateExperience(index, { description: e.target.value })
              }
            />
            <button
              type="button"
              className="experience-remove"
              onClick={() =>
                setExperience((entries) => entries.filter((_, i) => i !== index))
              }
            >
              <Trash2 size={15} /> Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="experience-add"
          onClick={() =>
            setExperience((entries) => [...entries, { role: "", org: "", description: "" }])
          }
        >
          <Plus size={15} /> Add experience
        </button>
      </fieldset>
      <div className="auth-field">
        <FieldLabel htmlFor="profile-hours">Weekly availability (hours)</FieldLabel>
        <input
          id="profile-hours"
          name="hours-per-week"
          type="number"
          min={0}
          max={80}
          step={1}
          defaultValue={initial?.hoursPerWeek ?? 10}
          required
          disabled={pending}
        />
      </div>
      <div className="auth-field">
        <FieldLabel htmlFor="profile-resume" optional>Resume (PDF, up to 8 MB)</FieldLabel>
        <input
          id="profile-resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md"
          disabled={pending}
          onChange={pickResume}
        />
        {resumeName && (
          <p className="auth-help">Selected: {resumeName}</p>
        )}
      </div>
      <label className="profile-check">
        <input
          type="checkbox"
          name="work-study"
          defaultChecked={initial?.workStudy ?? false}
          disabled={pending}
        />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Optional</span>
        I have Federal Work-Study eligibility
      </label>
      <label className="profile-check">
        <input
          type="checkbox"
          name="seeking-credit"
          defaultChecked={initial?.seekingCredit ?? false}
          disabled={pending}
        />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Optional</span>
        I’m looking to earn academic credit
      </label>
      <label className="profile-check">
        <input
          type="checkbox"
          name="recruitment-consent"
          defaultChecked={initial?.recruitmentConsent ?? false}
          disabled={pending}
        />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Optional</span>
        Professors may discover my profile when recruiting. Your profile stays
        private until you opt in.
      </label>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      {variant === "editor" && saved && (
        <p className="auth-notice" role="status">
          Profile saved. Your embedding is regenerating — AI matches refresh in
          a few seconds.
        </p>
      )}
      <button
        className="public-button auth-submit"
        disabled={pending || !account.isConfigured}
      >
        {pending && <LoaderCircle className="animate-spin" size={18} />}
        {pending
          ? "Saving your profile…"
          : variant === "editor"
            ? "Save profile"
            : "Save and continue"}
      </button>
    </form>
  );
}
