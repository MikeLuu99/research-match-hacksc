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

export function StudentProfileForm() {
  const account = useAccount();
  const upsertProfile = useMutation(api.users.upsertStudentProfile);
  const requestUploadUrl = useAction(api.users.generateResumeUploadUrl);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [resumeName, setResumeName] = useState("");

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
        skills: splitTags(String(data.get("skills") ?? "")),
        interests: splitTags(String(data.get("interests") ?? "")),
        experience,
        hoursPerWeek: Number(data.get("hours-per-week") ?? 0),
        workStudy: data.get("work-study") === "on",
        seekingCredit: data.get("seeking-credit") === "on",
        recruitmentConsent: data.get("recruitment-consent") === "on",
        resumeStorageId,
        resumeFileName: resumeStorageId ? resumeName || resumeFile?.name : undefined,
      });
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
        <label htmlFor="profile-major">Major</label>
        <input
          id="profile-major"
          name="major"
          placeholder="Computer Science"
          maxLength={120}
          required
          disabled={pending}
        />
      </div>
      <div className="auth-field">
        <label htmlFor="profile-year">School year</label>
        <select id="profile-year" name="school-year" required disabled={pending}>
          {SCHOOL_YEARS.map((year) => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>
      </div>
      <div className="auth-field">
        <label htmlFor="profile-skills">Skills</label>
        <input
          id="profile-skills"
          name="skills"
          placeholder="Python, React, machine learning"
          disabled={pending}
        />
        <p className="auth-help">Separate skills with commas.</p>
      </div>
      <div className="auth-field">
        <label htmlFor="profile-interests">Research interests</label>
        <input
          id="profile-interests"
          name="interests"
          placeholder="healthcare, natural language processing"
          disabled={pending}
        />
        <p className="auth-help">Separate interests with commas.</p>
      </div>
      <fieldset disabled={pending} className="experience-section">
        <legend>Experience</legend>
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
        <label htmlFor="profile-hours">Weekly availability (hours)</label>
        <input
          id="profile-hours"
          name="hours-per-week"
          type="number"
          min={0}
          max={80}
          step={1}
          defaultValue={10}
          required
          disabled={pending}
        />
      </div>
      <div className="auth-field">
        <label htmlFor="profile-resume">Resume (PDF, up to 8 MB)</label>
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
          disabled={pending}
        />
        I have Federal Work-Study eligibility
      </label>
      <label className="profile-check">
        <input
          type="checkbox"
          name="seeking-credit"
          disabled={pending}
        />
        I’m looking to earn academic credit
      </label>
      <label className="profile-check">
        <input
          type="checkbox"
          name="recruitment-consent"
          disabled={pending}
        />
        Professors may discover my profile when recruiting. Your profile stays
        private until you opt in.
      </label>
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
