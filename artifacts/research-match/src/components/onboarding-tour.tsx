import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { ArrowRight, GraduationCap, X } from "lucide-react";

export type TourStep = {
  selector: string;
  title: string;
  body: ReactNode;
};

// One-time guided tutorial: dims the page with a spotlight on each target
// element and shows a step-by-step callout card. Server-side rendering is a
// no-op; the tour only opens in the browser and never opens again once
// finished (localStorage, guarded for private-mode browsers).
export function OnboardingTour({
  tourId,
  steps,
}: {
  tourId: string;
  steps: TourStep[];
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(`labbe.tour.${tourId}`) !== "done") {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, [tourId]);

  const step = steps[index];

  useLayoutEffect(() => {
    if (!open || !step) return;
    const el = document.querySelector(step.selector);
    if (!el) {
      // Target missing (e.g., empty state variant): skip past it gracefully.
      if (index + 1 < steps.length) setIndex(index + 1);
      else finish();
      return;
    }
    const update = () => setRect(el.getBoundingClientRect());
    update();
    el.scrollIntoView({ block: "center" });
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, step?.selector]);

  const finish = () => {
    try {
      window.localStorage.setItem(`labbe.tour.${tourId}`, "done");
    } catch {
      // Private mode: tour simply shows again next visit.
    }
    setOpen(false);
  };

  if (!open || !step || !rect) return null;

  const cardWidth = 320;
  const margin = 16;
  const viewportWidth = window.innerWidth;
  const below = rect.bottom + 14;
  const spaceBelow = window.innerHeight - rect.bottom;
  const flip = spaceBelow < 190 && rect.top > 220;
  const top = flip ? undefined : below;
  const bottom = flip ? window.innerHeight - rect.top + 14 : undefined;
  const left = Math.min(
    Math.max(margin, rect.left),
    viewportWidth - cardWidth - margin,
  );

  return (
    <div role="dialog" aria-label="Guided tour" data-testid={`tour-${tourId}`}>
      {/* Spotlight: the giant box-shadow dims everything outside the target. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed z-40 rounded-xl border-2 border-primary transition-all duration-300"
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
          boxShadow: "0 0 0 9999px rgba(31, 31, 31, 0.42)",
        }}
      />
      <div
        data-testid={`tour-step-${index}`}
        className="fixed z-50 rounded-2xl border bg-card p-5 shadow-xl"
        style={{
          width: cardWidth,
          maxWidth: `calc(100vw - ${margin * 2}px)`,
          top,
          bottom,
          left,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
            <GraduationCap className="h-3.5 w-3.5" />
            Quick tour · {index + 1} of {steps.length}
          </span>
          <button
            data-testid="button-tour-skip"
            onClick={finish}
            aria-label="Skip tour"
            className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <h3 className="font-display text-lg mt-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={i === index ? "h-1.5 w-4 rounded-full bg-primary" : "h-1.5 w-1.5 rounded-full bg-muted-foreground/40"}
              />
            ))}
          </div>
          <button
            data-testid="button-tour-next"
            onClick={() => (index + 1 < steps.length ? setIndex(index + 1) : finish())}
            className="inline-flex items-center gap-1.5 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            {index + 1 < steps.length ? "Next" : "Got it"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
