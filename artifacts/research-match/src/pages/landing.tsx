import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  FlaskConical,
  GraduationCap,
  ListChecks,
  MoveUpRight,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { useAccount } from "@/lib/auth";
import { DEMO_STUDENTS } from "@/lib/data";
import { USC_PROJECTS } from "@/lib/usc-projects";
import { matchProject } from "@/lib/matching";
import { ScheduleGrid } from "@/components/schedule-grid";

export function chooseRole(role: "student" | "faculty") {
  try {
    sessionStorage.setItem("labbe.role", role);
  } catch {
    // sessionStorage can be unavailable; onboarding falls back to student.
  }
}

const STEPS = [
  {
    number: "01",
    title: "Upload your resume",
    body: "Add your skills, coursework, interests, and weekly availability.",
  },
  {
    number: "02",
    title: "Get matched",
    body: "AI recommends projects across every USC school, not just your major.",
  },
  {
    number: "03",
    title: "Draft your outreach",
    body: "Get a personalized intro email and smart questions for the professor.",
  },
  {
    number: "04",
    title: "Join a lab",
    body: "Connect, track applications, and start your research journey.",
  },
];

const QUOTES = ["a", "b", "c"];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Who can see my profile?",
    a: "Your profile is private by default. Professors only see you if you opt in to recruitment.",
  },
  {
    q: "Which labs are on Labbe?",
    a: "A verified sample of labs and centers across USC schools — Dornsife, Viterbi, Keck, Annenberg, Marshall and more, checked against public pages.",
  },
  {
    q: "Can research count for credit?",
    a: "Yes — listings that offer directed research credit carry a credit tag, and your tracker keeps them apart.",
  },
  {
    q: "I have no research experience. Can I still match?",
    a: "Absolutely. Matches explain your strengths and what you'd learn, and beginner-friendly labs are filtered in rather than screened out.",
  },
];

function SampleMatchCard() {
  const lab = USC_PROJECTS.find((p) => p.id === "usc-role-075") ?? USC_PROJECTS[0];
  return (
    <div className="match-sample" aria-label="Sample match for illustration">
      <div className="match-sample-top">
        <div>
          <p className="font-display text-lg leading-snug">{lab.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {lab.department} · {lab.minHours}-{lab.maxHours} h/week
          </p>
        </div>
        <span className="match-badge">92% match</span>
      </div>
      <p className="text-xs mt-3">
        <strong>Why you match:</strong> your analytics minor and survey
        experience fit this lab's patient data work.
      </p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {["Public health", "Survey methods", "Data analysis"].map((s) => (
          <span key={s} className="border border-primary/25 bg-primary/5 px-2 py-0.5 text-[11px] text-primary">
            {s}
          </span>
        ))}
      </div>
      <p className="match-sample-note">Sample match for illustration</p>
    </div>
  );
}

function RequirementsCard() {
  const rows: [string, "satisfied" | "missing" | "trainable"][] = [
    ["Statistical coursework", "satisfied"],
    ["Python basics", "satisfied"],
    ["Available Tue/Thu afternoons", "satisfied"],
    ["NLTK programming", "trainable"],
  ];
  return (
    <div className="match-sample" aria-label="Requirements check example">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary mb-3">
        Requirements check
      </p>
      {rows.map(([label, state]) => (
        <p key={label} className="flex items-center gap-2 py-1.5 text-xs">
          {state === "satisfied" ? (
            <Check size={14} className="text-chart-3" />
          ) : (
            <Sparkles size={14} className="text-chart-2" />
          )}
          <span>{label}</span>
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            {state}
          </span>
        </p>
      ))}
    </div>
  );
}

function WeekCard() {
  const value = "mon-10,mon-11,tue-14,tue-15,thu-10,thu-11,fri-15";
  return (
    <div className="match-sample" aria-label="Availability example">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary mb-3">
        Your week
      </p>
      <ScheduleGrid value={value} readOnly />
      <div className="flex flex-wrap gap-1.5 mt-4">
        <span className="border border-chart-2/40 bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">460 credit flag</span>
        <span className="border border-chart-2/40 bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">Fits Tue/Thu</span>
        <span className="border border-chart-2/40 bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">Beginner friendly</span>
      </div>
    </div>
  );
}

function OutreachCard() {
  return (
    <div className="match-sample" aria-label="Outreach draft example">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Draft</p>
      <p className="font-display text-base leading-snug">
        Interested in your patient data project
      </p>
      <p className="text-xs mt-2 text-muted-foreground leading-relaxed">
        Hi Dr. Rivera, I'm a sophomore studying health promotion with a minor
        in applied analytics. I'd love to support your survey data work…
      </p>
      <div className="flex gap-2 mt-3">
        <span className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
          <Send size={12} /> Send interest
        </span>
        <span className="inline-flex items-center border border-primary/25 px-3 py-1.5 text-xs">Edit draft</span>
      </div>
    </div>
  );
}

function CandidatesCard() {
  const sample = USC_PROJECTS.find((p) => p.id === "usc-role-075") ?? USC_PROJECTS[0];
  const scored = DEMO_STUDENTS.map((student) => ({
    student,
    m: matchProject(student, sample),
  }))
    .sort((a, b) => b.m.score - a.m.score)
    .slice(0, 3);
  return (
    <div className="match-sample" aria-label="Recommended candidates example">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary mb-3">
        Recommended candidates
      </p>
      {scored.map(({ student, m }) => (
        <div key={student.id} className="border-t border-primary/10 py-2.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold flex-1 min-w-0 truncate">
              {student.name}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {student.major} {student.year}
              </span>
            </p>
            <span className="match-badge">{Math.round(m.score)}%</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {student.skills.slice(0, 4).join(", ")}
          </p>
        </div>
      ))}
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground mt-3">
        Illustrative demo candidates
      </p>
    </div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAccount();
  return (
    <div className="marketing-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="public-header page-width">
        <Brand />
        <nav aria-label="Main navigation" className="public-nav">
          <a href="#how-it-works">How it works</a>
          <a href="#for-students">For students</a>
          <a href="#for-professors">For professors</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="header-actions">
          {!isAuthenticated && (
            <Link className="text-link" href="/sign-in">
              Log in
            </Link>
          )}
          <Link className="public-button button-small" href="/sign-up">
            Get matched
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <main id="main-content">
        <section className="landing-solo page-width">
          <div className="hero-flask" aria-hidden="true">
            <FlaskConical size={30} />
          </div>
          <h1 className="text-4xl md:text-6xl font-display leading-[1.02] mt-5">
            Find your lab.
            <br />
            <em className="text-primary not-italic">Fight on.</em>
          </h1>
          <p className="mt-5 text-muted-foreground max-w-xl text-[15px] leading-relaxed">
            The lab you're looking for may not know you're looking. Labbe uses
            AI to match USC students with research teams by skills, interests,
            and needs.
          </p>
          <div className="role-grid">
            <Link
              className="role-block"
              to="/sign-in"
              onClick={() => chooseRole("student")}
              data-testid="link-role-student"
            >
              <span className="role-tag">For students</span>
              <strong>I'm a student</strong>
              <small>AI matches you with labs across every USC department.</small>
              <span className="role-cta">
                Get matched <ArrowUpRight size={16} />
              </span>
            </Link>
            <Link
              className="role-block role-block-faculty"
              to="/sign-in"
              onClick={() => chooseRole("faculty")}
              data-testid="link-role-faculty"
            >
              <span className="role-tag">For faculty &amp; PIs</span>
              <strong>I'm a professor</strong>
              <small>Review AI-ranked, opted-in candidates.</small>
              <span className="role-cta">
                Post a project <ArrowUpRight size={16} />
              </span>
            </Link>
          </div>
          <p className="hero-footnote">
            Matching across Dornsife · Viterbi · Keck · Annenberg · Marshall
          </p>
          <SampleMatchCard />
        </section>

        <section className="value-strip page-width" aria-label="Labbe at a glance">
          <div>
            <FlaskConical />
            <span>
              <strong>60</strong>
              <small>labs &amp; centers verified</small>
            </span>
          </div>
          <div>
            <ListChecks />
            <span>
              <strong>82</strong>
              <small>roles checked from public pages</small>
            </span>
          </div>
          <div>
            <GraduationCap />
            <span>
              <strong>21</strong>
              <small>USC schools represented</small>
            </span>
          </div>
          <div>
            <Clock3 />
            <span>
              <strong>4 steps</strong>
              <small>to your first research match</small>
            </span>
          </div>
        </section>

        <section id="how-it-works" className="how-section page-width">
          <div className="section-heading" style={{ justifyContent: "center", textAlign: "center" }}>
            <div>
              <h2>How Labbe works</h2>
              <p>From resume to research team in four steps.</p>
            </div>
          </div>
          <div className="steps-grid">
            {STEPS.map((step) => (
              <article key={step.number}>
                <span className="step-number">
                  {step.number}
                  <MoveUpRight size={21} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="split-section page-width" id="for-students">
          <div className="split-copy">
            <p className="section-eyebrow">
              <span /> Explainable matches
            </p>
            <h2>Know exactly why a lab fits you.</h2>
            <p>
              Every match shows your strengths and what's missing — separating
              required skills from nice-to-haves, so beginners aren't screened
              out.
            </p>
          </div>
          <RequirementsCard />
        </section>

        <section className="split-section page-width split-reverse">
          <WeekCard />
          <div className="split-copy">
            <p className="section-eyebrow">
              <span /> Built around your degree
            </p>
            <h2>Research that counts and fits your schedule.</h2>
            <p>
              Labbe flags projects that may count toward directed research
              credit for your major, and only shows labs that match your free
              hours.
            </p>
          </div>
        </section>

        <section className="split-section page-width">
          <div className="split-copy">
            <p className="section-eyebrow">
              <span /> AI outreach assistant
            </p>
            <h2>No more cold emails into the void.</h2>
            <p>
              Labbe explains the research in plain language, then drafts a
              personal intro that connects your experience to the lab's work.
            </p>
          </div>
          <OutreachCard />
        </section>

        <section id="for-professors" className="faculty-section page-width">
          <div className="faculty-copy">
            <p className="section-eyebrow">For professors and lab managers</p>
            <h2>
              Find students who are ready to
              <br />
              contribute.
            </h2>
            <p>
              Post a project in minutes. Labbe recommends opted-in students
              from any department, with a clear explanation of their relevant
              experience.
            </p>
            <Link href="/sign-up" className="public-button button-gold">
              Post a project
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <CandidatesCard />
        </section>

        <section className="closing-section page-width">
          <h2>Trojans told us research was hard to find.</h2>
          <div className="quote-grid">
            {QUOTES.map((quote) => (
              <div key={quote} className="match-sample quote-card">
                <p className="text-sm">“[Quote from a student interview]”</p>
                <p className="text-[11px] text-muted-foreground mt-3">
                  [name, major, year]
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="how-section page-width">
          <h2 className="font-display text-3xl text-center mb-8">
            Questions, answered
          </h2>
          <div className="faq-list">
            {FAQS.map((faq) => (
              <details key={faq.q} className="faq-item">
                <summary>{faq.q}</summary>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cta-panel page-width">
          <div className="hero-flask hero-flask-gold" aria-hidden="true">
            <FlaskConical size={30} />
          </div>
          <h2>Your lab is out there.</h2>
          <p>Upload your resume and see your matches in minutes.</p>
          <Link href="/sign-up" className="public-button button-gold">
            Get matched
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="public-footer page-width">
        <Brand />
        <p>
          Built at the Ai3USC Hackathon. Lab data from public USC pages
          (checked Nov 2026), not lab-confirmed. Not an official USC service.
        </p>
        <a href="#main-content" className="secondary-link">
          Back to top ↑
        </a>
      </footer>
    </div>
  );
}

