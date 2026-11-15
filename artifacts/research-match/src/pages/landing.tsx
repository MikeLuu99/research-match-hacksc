import { Link, Redirect } from "wouter";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { useAccount } from "@/lib/auth";

export function chooseRole(role: "student" | "faculty") {
  try {
    sessionStorage.setItem("labbe.role", role);
  } catch {
    // sessionStorage can be unavailable; onboarding falls back to student.
  }
}

export default function Landing() {
  const { isAuthenticated, viewer } = useAccount();
  // Signed-in users belong in their workspace, not on the marketing page.
  if (isAuthenticated && viewer?.accountType)
    return <Redirect to={viewer.accountType === "faculty" ? "~/app/faculty" : "~/app"} replace />;
  return (
    <div className="marketing-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="public-header page-width">
        <Brand />
        <div className="header-actions">
          {!isAuthenticated && (
            <Link className="text-link" href="/sign-in">
              Sign in
            </Link>
          )}
        </div>
      </header>
      <main id="main-content">
        <section className="landing-hero page-width landing-solo">
          <h1>
            Research connections, <em>matched by AI.</em>
          </h1>
          <div className="role-grid">
            <Link
              className="role-block"
              to="/sign-in"
              onClick={() => chooseRole("student")}
              data-testid="link-role-student"
            >
              <span className="role-tag">For students</span>
              <strong>Find your research fit</strong>
              <small>AI matches you with labs across every USC department.</small>
              <span className="role-cta">
                Continue as a student <ArrowUpRight size={16} />
              </span>
            </Link>
            <Link
              className="role-block role-block-faculty"
              to="/sign-in"
              onClick={() => chooseRole("faculty")}
              data-testid="link-role-faculty"
            >
              <span className="role-tag">For faculty &amp; PIs</span>
              <strong>Recruit the right students</strong>
              <small>Review AI-ranked, opted-in candidates.</small>
              <span className="role-cta">
                Continue as faculty <ArrowUpRight size={16} />
              </span>
            </Link>
          </div>
          <div className="hero-actions">
            <Link href="/demo" className="secondary-link">
              Or explore the demo first
              <ArrowRight size={17} />
            </Link>
          </div>
          <p className="hero-footnote">
            Your profile stays private until you choose to share.
          </p>
        </section>
      </main>
      <footer className="public-footer page-width">
        <Brand />
        <p>
          An independent USC research-matching prototype. Lab data from public
          USC pages (checked Nov 2026), not lab-confirmed. Not an official USC
          service.
        </p>
      </footer>
    </div>
  );
}
