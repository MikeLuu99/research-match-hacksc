import { useState, type ChangeEvent, type FormEvent } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/lib/convex-api";
import { USC_MAJORS, USC_MINORS } from "@/lib/usc-programs";
import { RESEARCH_SKILLS } from "@/lib/research-skills";
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
  minors: string[];
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
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [skillDraft, setSkillDraft] = useState("");
  const [resumeName, setResumeName] = useState(initial?.resumeFileName ?? "");

  function addSkill(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setSkills((current) => {
      if (current.some((skill) => skill.toLowerCase() === value.toLowerCase()))
        return current;
      return [...current, value].slice(0, 30);
    });
    setSkillDraft("");
  }

  function removeSkill(value: string) {
    setSkills((current) => current.filter((skill) => skill !== value));
  }

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
    event.currentTarget;
    const data = new FormData(event.currentTarget);
    const resumeInput = event.currentTarget.elements.namedItem(
      "resume",
    ) as HTMLInputElement | null;
    const resumeFile = resumeInput?.files?.[0];
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
        minors: splitTags(String(data.get("minors") ?? "")),
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
      <datalist id="usc-majors-list">
        {USC_MAJORS.map((program) => (
          <option key={program.name} value={program.name} />
        ))}
      </datalist>
      <datalist id="usc-minors-list">
        {USC_MINORS.map((program) => (
          <option key={program.name} value={program.name} />
        ))}
      </datalist>
      <datalist id="research-skills-list">
        {RESEARCH_SKILLS.map((skill) => (
          <option key={skill} value={skill} />
        ))}
      </datalist>
      <div className="auth-field">
        <FieldLabel htmlFor="profile-major">Major</FieldLabel>
        <input
          id="profile-major"
          name="major"
          list="usc-majors-list"
          placeholder="Computer Science"
          maxLength={120}
          required
          disabled={pending}
          defaultValue={initial?.major ?? ""}
        />
      </div>
      <div className="auth-field">
        <FieldLabel htmlFor="profile-minors" optional>
          Minors
        </FieldLabel>
        <input
          id="profile-minors"
          name="minors"
          placeholder="Optional — e.g. Computer Science"
          maxLength={120}
          disabled={pending}
          list="usc-minors-list"
          defaultValue={initial?.minors.join(", ") ?? ""}
        />
        <p className="auth-help">USC minors only, one for now.</p>
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
          list="research-skills-list"
          placeholder="Start typing — pick a suggestion or add your own"
          disabled={pending}
          value={skillDraft}
          onChange={(event) => setSkillDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addSkill(skillDraft);
            }
          }}
          onBlur={() => addSkill(skillDraft)}
        />
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 border border-primary/25 bg-primary/8 px-2 py-0.5 text-xs text-primary"
              >
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  disabled={pending}
                  onClick={() => removeSkill(skill)}
                  className="hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="auth-help">
          Press Enter or comma to add. Suggestions include common research
          skills. At least one skill or research interest is required.
        </p>
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
