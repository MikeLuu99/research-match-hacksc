import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export type TourStep = {
  selector: string;
  title: string;
  body: string;
};

// One-time guided tutorial powered by driver.js: spotlight + step-by-step
// popover. Shows once per browser (localStorage-gated, guarded for
// private-mode browsing); server-side rendering is a no-op.
export function OnboardingTour({
  tourId,
  steps,
}: {
  tourId: string;
  steps: TourStep[];
}) {
  const stepsKey = JSON.stringify(steps);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(`labbe.tour.${tourId}`) === "done") return;
    } catch {
      // Private mode: show anyway.
    }
    const markDone = () => {
      try {
        window.localStorage.setItem(`labbe.tour.${tourId}`, "done");
      } catch {
        // Tour simply shows again next visit.
      }
    };
    const resolved = steps
      .map((step) => {
        const el = document.querySelector(step.selector);
        return el
          ? {
              element: el,
              popover: { title: step.title, description: step.body },
            }
          : null;
      })
      .filter((entry) => entry !== null);
    if (!resolved.length) {
      markDone();
      return;
    }
    const driverObj = driver({
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Got it",
      popoverClass: "driverjs-theme",
      steps: resolved,
      onDestroyed: markDone,
    });
    driverObj.drive();
    return () => {
      driverObj.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId, stepsKey]);

  return null;
}
