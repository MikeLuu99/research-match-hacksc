import type { ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  FlaskConical,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "./brand";

export function AuthFrame({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <Brand light />
        <div className="auth-story-copy">
          <p className="section-eyebrow">A LITTLE CURIOSITY GOES A LONG WAY.</p>
          <h2>
            Different paths.
            <br />
            One shared
            <br />
            <em>possibility.</em>
          </h2>
          <p>
            The right research connection can change the way you see your
            future. Let’s find yours.
          </p>
          <div className="auth-story-orbit" aria-hidden="true">
            <span />
            <FlaskConical size={36} strokeWidth={1.3} />
            <GraduationCap size={30} strokeWidth={1.3} />
          </div>
        </div>
        <p className="auth-story-footer">
          BUILT FOR DISCOVERY. INSPIRED BY USC.
        </p>
      </aside>
      <main className="auth-main">
        <Link href="/" className="auth-back">
          <ArrowLeft size={16} />
          Back to ResearchMatch
        </Link>
        <div className="auth-content">
          <p className="section-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="auth-intro">{intro}</p>
          {children}
          <p className="auth-privacy">
            <ShieldCheck size={16} />
            Your curiosity is yours. So is your privacy.
          </p>
        </div>
        <p className="auth-footer">
          Independent prototype · Not an official USC service
        </p>
      </main>
    </div>
  );
}
