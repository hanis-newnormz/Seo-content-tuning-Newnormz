import { ArrowRight, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

export function BeforeAfter({
  current,
  recommended,
  reason,
  className,
}: {
  current: string | null;
  recommended: string;
  reason?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-secondary/40 p-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Current
          </p>
          <p className="text-sm text-muted-foreground">
            {current || <span className="italic">No existing content captured</span>}
          </p>
        </div>
        <div className="relative rounded-lg border border-accent/30 bg-accent/10 p-3">
          <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
            <ArrowRight className="h-3 w-3" /> Recommended
          </p>
          <p className="text-sm font-medium text-foreground">{recommended}</p>
        </div>
      </div>
      {reason && (
        <div className="flex gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p>{reason}</p>
        </div>
      )}
    </div>
  );
}
