import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Small info icon with an explanatory tooltip, for onboarding and form
// help text. Works for keyboard users (focus shows the tooltip).
export function InfoTip({
  label,
  children,
  testId,
}: {
  label: string;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        data-testid={testId}
        aria-label={label}
        className="inline-flex h-4 w-4 items-center justify-center align-middle text-muted-foreground transition-colors hover:text-foreground"
      >
        <Info className="h-3.5 w-3.5" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64 text-start leading-snug">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
