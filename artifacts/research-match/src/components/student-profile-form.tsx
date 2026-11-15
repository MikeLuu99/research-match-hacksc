import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Check, LoaderCircle, Plus, Trash2 } from "lucide-react";
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

type ProfileFormValues = {
  major: string;
  minors: string;
  schoolYear: string;
  skills: string[];
  interests: string;
  experience: ExperienceEntry[];
  hoursPerWeek: number;
  workStudy: boolean;
  seekingCredit: boolean;
  recruitmentConsent: boolean;
  resumeFileName: string;
};

function valuesFromInitial(
  initial: StudentProfileInitial | undefined,
): ProfileFormValues {
  return {
    major: initial?.major ?? "",
    minors: initial?.minors.join(", ") ?? "",
    schoolYear: initial?.schoolYear ?? "freshman",
    skills: initial?.skills ?? [],
    interests: initial?.interests.join(", ") ?? "",
    experience: initial?.experience ?? [],
    hoursPerWeek: initial?.hoursPerWeek ?? 10,
    workStudy: initial?.workStudy ?? false,
    seekingCredit: initial?.seekingCredit ?? false,
    recruitmentConsent: initial?.recruitmentConsent ?? false,
    resumeFileName: initial?.resumeFileName ?? "",
  };
}

// Shared editable fields for onboarding and the profile editor — one markup,
// uncontrolled inputs driven by `initial`.
function ProfileFields({
  initial,
  pending,
  skills,
  skillDraft,
  setSkillDraft,
  addSkill,
  removeSkill,
}: {
  initial?: StudentProfileInitial;
  pending: boolean;
  skills: string[];
  skillDraft: string;
  setSkillDraft: (value: string) => void;
  addSkill: (value: string) => void;
  removeSkill: (value: string) => void;
}) {
  return (
    <>
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
        <FieldLabel htmlFor="profile-interests" optional>
          Research interests
        </FieldLabel>
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
        <legend>Experience</legend>
        <ExperienceEditor pending={pending} initial={initial} />
      </fieldset>
      <div className="auth-field">
        <FieldLabel htmlFor="profile-hours">
          Weekly availability (hours)
        </FieldLabel>
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
        <FieldLabel htmlFor="profile-resume" optional>
          Resume (PDF, up to 8 MB)
        </FieldLabel>
        <input
          id="profile-resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md"
          disabled={pending}
        />
        {initial?.resumeFileName && (
          <p className="auth-help">On file: {initial.resumeFileName}</p>
        )}
      </div>
      <label className="profile-check">
        <input type="checkbox" name="work-study" disabled={pending} />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          Optional
        </span>
        I have Federal Work-Study eligibility
      </label>
      <label className="profile-check">
        <input type="checkbox" name="seeking-credit" disabled={pending} />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          Optional
        </span>
        I’m looking to earn academic credit
      </label>
      <label className="profile-check">
        <input type="checkbox" name="recruitment-consent" disabled={pending} />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          Optional
        </span>
        Professors may discover my profile when recruiting. Your profile stays
        private until you opt in.
      </label>
    </>
  );
}

// Experience entries live in a ref'd array the submit handler reads; entries
// are edited directly through uncontrolled inputs so the shared field set
// stays stateless.
function ExperienceEditor({
  pending,
  initial,
}: {
  pending: boolean;
  initial?: StudentProfileInitial;
}) {
  const entriesRef = useRef<ExperienceEntry[]>(
    initial?.experience ?? [],
  );
  const [, forceRender] = useState(0);
  void forceRender;

  function update(index: number, patch: Partial<ExperienceEntry>) {
    entriesRef.current = entriesRef.current.map((entry, i) =>
      i === index ? { ...entry, ...patch } : entry,
    );
    forceRender((n) => n + 1);
  }

  return (
    <>
      {entriesRef.current.length === 0 && (
        <p className="auth-help">
          Add roles, campus jobs, or projects. You can also skip this and
          attach a resume below.
        </p>
      )}
      {entriesRef.current.map((entry, index) => (
        <div className="experience-entry" key={index}>
          <div className="experience-row">
            <input
              aria-label="Role"
              placeholder="Role (e.g. Course grader)"
              defaultValue={entry.role}
              maxLength={80}
              disabled={pending}
              onChange={(e) => update(index, { role: e.target.value })}
            />
            <input
              aria-label="Organization"
              placeholder="Organization"
              defaultValue={entry.org}
              maxLength={80}
              disabled={pending}
              onChange={(e) => update(index, { org: e.target.value })}
            />
          </div>
          <textarea
            aria-label="Description"
            placeholder="What did you do?"
            defaultValue={entry.description}
            maxLength={600}
            disabled={pending}
            onChange={(e) => update(index, { description: e.target.value })}
          />
          <button
            type="button"
            className="experience-remove"
            disabled={pending}
            onClick={() => {
              entriesRef.current = entriesRef.current.filter(
                (_, i) => i !== index,
              );
              forceRender((n) => n + 1);
            }}
          >
            <Trash2 size={15} /> Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="experience-add"
        disabled={pending}
        onClick={() => {
          entriesRef.current = [
            ...entriesRef.current,
            { role: "", org: "", description: "" },
          ];
          forceRender((n) => n + 1);
        }}
      >
        <Plus size={15} /> Add experience
      </button>
    </>
  );
}

// The shared submit path: upload the resume (if any), then upsert the whole
// profile. The scheduled embedStudent action re-ingests it into vectors.
async function submitProfile(
  form: HTMLFormElement,
  skills: string[],
  experience: ExperienceEntry[],
  pending: (value: boolean) => void,
  requestUploadUrl: (args: {}) => Promise<{ url: string }>,
  upsertProfile: (args: Record<string, unknown>) => Promise<unknown>,
  setError: (message: string) => void,
) {
  const data = new FormData(form);
  const resumeInput = form.elements.namedItem(
    "resume",
  ) as HTMLInputElement | null;
  const resumeFile = resumeInput?.files?.[0];
  if (skills.length === 0 && splitTags(String(data.get("interests") ?? "")).length === 0) {
    setError("Add at least one skill or research interest to save your profile.");
    form.querySelector<HTMLElement>("#profile-skills")?.focus();
    return false;
  }
  pending(true);
  setError("");
  try {
    let resumeStorageId: string | undefined;
    let resumeFileName: string | undefined;
    if (resumeFile) {
      const { url } = await requestUploadUrl({});
      const response = await fetch(url, {
        method: "POST",
        body: resumeFile,
        headers: {
          "Content-Type": resumeFile.type || "application/octet-stream",
        },
      });
      if (!response.ok) throw new Error("Resume upload failed.");
      const uploaded = (await response.json()) as { storageId: string };
      resumeStorageId = uploaded.storageId;
      resumeFileName = resumeFile.name;
    }
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
      interests: splitTags(String(data.get("interests") ?? "")),
      experience,
      hoursPerWeek: Number(data.get("hours-per-week") ?? 0),
      workStudy: data.get("work-study") === "on",
      seekingCredit: data.get("seeking-credit") === "on",
      recruitmentConsent: data.get("recruitment-consent") === "on",
      resumeStorageId,
      resumeFileName,
    });
    return true;
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "We couldn’t save your profile. Please try again.",
    );
    return false;
  } finally {
    pending(false);
  }
}

// Onboarding: one form, one save, then straight to the student workspace.
export function StudentProfileForm({
  initial,
}: {
  initial?: StudentProfileInitial;
}) {
  const account = useAccount();
  const upsertProfile = useMutation(api.users.upsertStudentProfile);
  const requestUploadUrl = useAction(api.users.generateResumeUploadUrl);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [skillDraft, setSkillDraft] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const experienceRef = useRef<ExperienceEntry[]>(initial?.experience ?? []);

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

  return (
    <form
      ref={formRef}
      className="auth-form profile-form"
      onSubmit={async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!formRef.current) return;
        const ok = await submitProfile(
          formRef.current,
          skills,
          experienceRef.current,
          setPending,
          requestUploadUrl,
          upsertProfile,
          setError,
        );
        if (ok)
          window.location.assign(
            `${window.location.origin}${import.meta.env.BASE_URL}app/student`,
          );
      }}
    >
      <ProfileFields
        initial={initial}
        pending={pending}
        skills={skills}
        skillDraft={skillDraft}
        setSkillDraft={setSkillDraft}
        addSkill={addSkill}
        removeSkill={removeSkill}
      />
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <button
        className="public-button auth-submit"
        disabled={pending || !account.isConfigured}
      >
        {pending && <LoaderCircle className="animate-spin" size={18} />}
        {pending ? "Saving your profile…" : "Save and continue"}
      </button>
    </form>
  );
}

// Profile editor: one form, one Save button, with a clear confirmation that
// the new data was submitted and the embedding is regenerating.
export function ProfileEditor({
  initial,
}: {
  initial?: StudentProfileInitial;
}) {
  const account = useAccount();
  const upsertProfile = useMutation(api.users.upsertStudentProfile);
  const requestUploadUrl = useAction(api.users.generateResumeUploadUrl);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [skillDraft, setSkillDraft] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const experienceRef = useRef<ExperienceEntry[]>(initial?.experience ?? []);

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

  return (
    <form
      ref={formRef}
      className="auth-form profile-form"
      onSubmit={async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!formRef.current) return;
        const ok = await submitProfile(
          formRef.current,
          skills,
          experienceRef.current,
          setPending,
          requestUploadUrl,
          upsertProfile,
          setError,
        );
        if (ok) {
          setSaved(true);
          window.setTimeout(() => setSaved(false), 8000);
        }
      }}
    >
      <ProfileFields
        initial={initial}
        pending={pending}
        skills={skills}
        skillDraft={skillDraft}
        setSkillDraft={setSkillDraft}
        addSkill={addSkill}
        removeSkill={removeSkill}
      />
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="auth-notice flex items-center gap-2" role="status">
          <Check size={16} /> Profile saved. Your data is submitted and the
          embedding is regenerating — AI matches refresh in a few seconds.
        </p>
      )}
      <button
        className="public-button auth-submit"
        disabled={pending || !account.isConfigured}
      >
        {pending && <LoaderCircle className="animate-spin" size={18} />}
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
