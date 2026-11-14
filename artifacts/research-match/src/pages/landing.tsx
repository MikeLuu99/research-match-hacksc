import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  FlaskConical,
  GraduationCap,
  MoveUpRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { useAccount } from "@/lib/auth";

const steps = [
  {
    number: "01",
    title: "Bring your curiosity.",
    body: "Share your interests, coursework, skills, and availability. Your experience has a place to start.",
  },
  {
    number: "02",
    title: "Find the unexpected fit.",
    body: "Explore research beyond your department, with clear explanations of your strengths and the skills you can build.",
  },
  {
    number: "03",
    title: "Start a conversation.",
    body: "Get to know a project, prepare thoughtful outreach, and keep your next steps in one place.",
  },
];

function ResearchPreview() {
  return (
    <div
      className="research-preview"
      aria-label="Illustrative research matching preview"
    >
      <div className="preview-orbit orbit-one" />
      <div className="preview-orbit orbit-two" />
      <div className="preview-grid" />
      <span className="preview-spark" aria-hidden="true">
        ✳
      </span>
      <div className="preview-label">
        <span /> CONNECTIONS BEYOND YOUR MAJOR
      </div>
      <div className="preview-profile">
        <div className="preview-avatar">
          <GraduationCap size={23} />
        </div>
        <div>
          <strong>A curious mind.</strong>
          <span>Computer science + healthcare</span>
        </div>
        <span className="profile-status">
          <span /> Exploring
        </span>
      </div>
      <div className="preview-thread" aria-hidden="true">
        <span />
        <Sparkles size={20} />
        <span />
      </div>
      <div className="preview-project">
        <div className="preview-project-top">
          <span className="mini-eyebrow">BIOMEDICAL ENGINEERING</span>
          <span className="opportunity-tag">Example project</span>
        </div>
        <div className="preview-project-icon">
          <FlaskConical size={23} />
        </div>
        <h2>
          Better healthcare.
          <br />
          Powered by your code.
        </h2>
        <p>
          Explore how machine learning could help make sense of health data.
        </p>
        <div className="preview-skills">
          <span>Python</span>
          <span>Machine learning</span>
          <span>Curiosity</span>
        </div>
        <div className="preview-fit">
          <Sparkles size={17} />
          <div>
            <strong>See the connection</strong>
            <p>Your programming skills can travel into a new field.</p>
          </div>
          <ArrowUpRight size={20} />
        </div>
      </div>
      <div className="preview-note">
        <span>↗</span> A different department.
        <br />
        <strong>A shared direction.</strong>
      </div>
      <p className="preview-disclaimer">
        Illustrative match · explore fictional projects in the demo
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
          <a href="#for-faculty">For faculty</a>
        </nav>
        <div className="header-actions">
          <Link className="text-link" href="/sign-in">
            Sign in
          </Link>
          <Link
            className="public-button button-small"
            href={isAuthenticated ? "/app" : "/sign-up"}
          >
            {isAuthenticated ? "Your workspace" : "Get started"}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <main id="main-content">
        <section className="landing-hero page-width">
          <div className="hero-copy">
            <p className="section-eyebrow">
              <span /> BIG IDEAS CROSS DEPARTMENTS
            </p>
            <h1>
              Your curiosity.
              <br />
              The right lab.
              <br />
              <em>A new possibility.</em>
            </h1>
            <p className="hero-description">
              Find where you belong in research. Connect your skills and
              interests with projects across USC—and discover a direction you
              hadn’t considered.
            </p>
            <div className="hero-actions">
              <Link className="public-button" href="/sign-up">
                Find your research fit
                <ArrowUpRight size={19} />
              </Link>
              <Link href="/demo" className="secondary-link">
                Explore the demo
                <ArrowRight size={17} />
              </Link>
            </div>
            <p className="hero-footnote">
              <ShieldCheck size={15} /> Your profile stays private until you
              choose to share.
            </p>
          </div>
          <ResearchPreview />
        </section>
        <section
          className="value-strip page-width"
          aria-label="Designed around you"
        >
          <div>
            <GraduationCap />
            <span>
              <strong>Every discipline belongs.</strong>
              <small>Look beyond the boundaries of your major.</small>
            </span>
          </div>
          <div>
            <Clock3 />
            <span>
              <strong>A fit for your real life.</strong>
              <small>Consider coursework, credit, and your schedule.</small>
            </span>
          </div>
          <div>
            <Sparkles />
            <span>
              <strong>Understand the connection.</strong>
              <small>See your strengths and room to grow.</small>
            </span>
          </div>
        </section>
        <section id="how-it-works" className="how-section page-width">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">
                FROM “WHAT IF?” TO “WHAT’S NEXT?”
              </p>
              <h2>
                Great research starts
                <br />
                with a connection.
              </h2>
            </div>
            <p>
              You don’t need to know the right people.
              <br />
              You just need a place to begin.
            </p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
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
        <section id="for-faculty" className="faculty-section page-width">
          <div className="faculty-art" aria-hidden="true">
            <span className="faculty-orbit" />
            <FlaskConical size={62} strokeWidth={1.2} />
            <span className="faculty-art-label">
              DIFFERENT PERSPECTIVES.
              <br />
              SHARED DISCOVERIES.
            </span>
            <span className="faculty-dot dot-a" />
            <span className="faculty-dot dot-b" />
            <span className="faculty-dot dot-c" />
          </div>
          <div className="faculty-copy">
            <p className="section-eyebrow">FOR PROFESSORS & RESEARCH TEAMS</p>
            <h2>
              Your next collaborator
              <br />
              might be one major over.
            </h2>
            <p>
              Make your research visible across campus. Describe your project
              and discover students whose interests, skills, and availability
              align with your team.
            </p>
            <ul>
              <li>
                <Check size={17} /> Reach students across departments
              </li>
              <li>
                <Check size={17} /> Review the experience behind each match
              </li>
              <li>
                <Check size={17} /> Connect with students who opt into discovery
              </li>
            </ul>
            <Link href="/sign-up" className="public-button button-gold">
              Build your research team
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
        <section className="closing-section page-width">
          <p className="section-eyebrow">THERE’S MORE TO DISCOVER</p>
          <h2>Let curiosity open the door.</h2>
          <Link href="/sign-up" className="public-button">
            Find your starting point
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="public-footer page-width">
        <Brand />
        <p>
          An independent USC research-matching prototype.
          <br />
          Demo opportunities are fictional. Not an official USC service.
        </p>
        <a href="#main-content" className="secondary-link">
          Back to top ↑
        </a>
      </footer>
    </div>
  );
}
