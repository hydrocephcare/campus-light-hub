import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Shared editorial section header: gold eyebrow, large serif title, optional action on the right. */
export const SectionHeading = ({ eyebrow, title, description, action, className }: SectionHeadingProps) => (
  <div className={cn("mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between", className)}>
    <div className="max-w-2xl">
      <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
        <span className="h-px w-8 bg-secondary" />
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold leading-tight text-foreground md:text-5xl">{title}</h2>
      {description && <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
