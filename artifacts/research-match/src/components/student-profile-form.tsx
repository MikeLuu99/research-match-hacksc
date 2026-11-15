import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Check, ImagePlus, LoaderCircle, Plus, Trash2, UserRound } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/lib/convex-api";
import { USC_MAJORS, USC_MINORS } from "@/lib/usc-programs";
import { RESEARCH_SKILLS } from "@/lib/research-skills";
import {
  ScheduleGrid,
  scheduleHourCount,
} from "@/components/schedule-grid";
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
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function photoFileProblem(file: File) {
  if (!PHOTO_TYPES.includes(file.type.toLowerCase()))
    return "Choose a JPEG, PNG, WebP or GIF image.";
  if (file.size > MAX_PHOTO_BYTES) return "Photos must be 2 MB or smaller.";
  return null;
}

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
  schedule?: string;
  bio?: string;
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
  photoUrl?: string;
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

// Optional profile picture with a live preview. The file input keeps the
// chosen image for the submit handler; "remove-photo" clears a saved one.
function PhotoField({
  initialUrl,
  pending,
}: {
  initialUrl?: string;
  pending: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(initialUrl);
  const [removed, setRemoved] = useState(false);
  const [problem, setProblem] = useState("");

  useEffect(
    () => () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const issue = photoFileProblem(file);
    if (issue) {
      setProblem(issue);
      event.target.value = "";
      return;
    }
    setProblem("");
    setRemoved(false);
    setPreview(URL.createObjectURL(file));
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(undefined);
    setProblem("");
    setRemoved(Boolean(initialUrl));
  }

  return (
    <div className="auth-field">
      <FieldLabel htmlFor="profile-photo" optional>
        Profile photo
      </FieldLabel>
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/25 bg-primary/5 text-primary/60">
          {preview ? (
            <img
              src={preview}
              alt="Profile photo preview"
              data-testid="img-profile-photo-preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound size={32} aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="profile-photo"
            className="inline-flex cursor-pointer items-center gap-1.5 border border-primary/25 px-3 py-1.5 text-xs hover:bg-primary/5"
          >
            <ImagePlus size={14} /> {preview ? "Change photo" : "Upload photo"}
          </label>
          {preview && (
            <button
              type="button"
              data-testid="button-remove-photo"
              disabled={pending}
              onClick={clear}
              className="inline-flex items-center gap-1.5 border border-primary/25 px-3 py-1.5 text-xs hover:text-destructive"
            >
              <Trash2 size={14} /> Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        id="profile-photo"
        name="photo"
        type="file"
        accept={PHOTO_TYPES.join(",")}
        disabled={pending}
        onChange={onChange}
        className="sr-only"
      />
      {removed && <input type="hidden" name="remove-photo" value="on" />}
      {problem ? (
        <p className="auth-error" role="alert">
          {problem}
        </p>
      ) : (
        <p className="auth-help">
          JPEG, PNG, WebP or GIF, up to 2 MB. Professors see it with your
          profile. You can skip this.
        </p>
      )}
    </div>
  );
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
  schedule,
  setSchedule,
}: {
  initial?: StudentProfileInitial;
  pending: boolean;
  skills: string[];
  skillDraft: string;
  setSkillDraft: (value: string) => void;
  addSkill: (value: string) => void;
  removeSkill: (value: string) => void;
  schedule: string;
  setSchedule: (value: string) => void;
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
      <PhotoField initialUrl={initial?.photoUrl} pending={pending} />
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
        <FieldLabel htmlFor="profile-bio" optional>
          About you
        </FieldLabel>
        <textarea
          id="profile-bio"
          name="bio"
          placeholder="A sentence or two about your curiosity and goals — helps labs understand you."
          maxLength={1000}
          disabled={pending}
          defaultValue={initial?.bio ?? ""}
        />
        <p className="auth-help">Shown with your profile; also feeds your AI matches.</p>
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
        <FieldLabel htmlFor="profile-schedule" optional>
          Weekly availability
        </FieldLabel>
        <p className="auth-help">
          Click or drag across the grid to mark when you're free. Professors
          see this schedule — currently{" "}
          <strong className="text-primary">
            {scheduleHourCount(schedule)} h/week
          </strong>
          .
        </p>
        <ScheduleGrid
          value={schedule}
          onChange={(next) => setSchedule(next)}
        />
        <input type="hidden" name="schedule" value={schedule} />
        <input
          type="hidden"
          name="hours-per-week"
          value={scheduleHourCount(schedule)}
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
        <input
          type="checkbox"
          name="work-study"
          defaultChecked={initial?.workStudy ?? false}
          disabled={pending}
        />
        <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          Optional
        </span>
        I have Federal Work-Study eligibility
      </label>
      <label className="profile-check">
        <input
          type="checkbox"
          name="seeking-credit"
          defaultChecked={initial?.seekingCredit ?? false}
          disabled={pending}
        />
        <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          Optional
        </span>
        I’m looking to earn academic credit
      </label>
      <label className="profile-check">
        <input
          type="checkbox"
          name="recruitment-consent"
          defaultChecked={initial?.recruitmentConsent ?? false}
          disabled={pending}
        />
        <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
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
  requestPhotoUploadUrl: (args: {}) => Promise<{ url: string }>,
  upsertProfile: (args: Record<string, unknown>) => Promise<unknown>,
  setError: (message: string) => void,
) {
  const data = new FormData(form);
  const resumeInput = form.elements.namedItem(
    "resume",
  ) as HTMLInputElement | null;
  const resumeFile = resumeInput?.files?.[0];
  const photoInput = form.elements.namedItem(
    "photo",
  ) as HTMLInputElement | null;
  const photoFile = photoInput?.files?.[0];
  if (photoFile) {
    const issue = photoFileProblem(photoFile);
    if (issue) {
      setError(issue);
      return false;
    }
  }
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
    let photoStorageId: string | undefined;
    if (photoFile) {
      const { url } = await requestPhotoUploadUrl({});
      const response = await fetch(url, {
        method: "POST",
        body: photoFile,
        headers: { "Content-Type": photoFile.type },
      });
      if (!response.ok) throw new Error("Photo upload failed.");
      const uploaded = (await response.json()) as { storageId: string };
      photoStorageId = uploaded.storageId;
    }
    await upsertProfile({
      major: String(data.get("major") ?? ""),
      schedule: String(data.get("schedule") ?? "").trim(),
      bio: String(data.get("bio") ?? "").trim().slice(0, 1000),
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
      photoStorageId,
      removePhoto: !photoStorageId && data.get("remove-photo") === "on",
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
  const requestPhotoUploadUrl = useAction(api.users.generatePhotoUploadUrl);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [skillDraft, setSkillDraft] = useState("");
  const [schedule, setSchedule] = useState(initial?.schedule ?? "");
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
          requestPhotoUploadUrl,
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
        schedule={schedule}
        setSchedule={setSchedule}
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
  const requestPhotoUploadUrl = useAction(api.users.generatePhotoUploadUrl);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [skillDraft, setSkillDraft] = useState("");
  const [schedule, setSchedule] = useState(initial?.schedule ?? "");
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
          requestPhotoUploadUrl,
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
        schedule={schedule}
        setSchedule={setSchedule}
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
