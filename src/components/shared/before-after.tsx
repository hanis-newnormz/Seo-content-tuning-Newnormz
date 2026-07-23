import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function BeforeAfter({
  current,
  recommended,
  explanation,
  className,
}: {
  current?: string | null;
  recommended: string;
  explanation?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        <div className="rounded-lg border border-border bg-secondary/40 p-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Current
          </p>
          <p className="text-sm text-foreground/80">{current || "—"}</p>
        </div>
        <div className="hidden items-center justify-center sm:flex">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="rounded-lg border border-success/30 bg-success/5 p-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-success">Recommended</p>
          <p className="text-sm font-medium text-foreground">{recommended}</p>
        </div>
      </div>
      {explanation && <p className="text-sm text-muted-foreground">{explanation}</p>}
    </div>
  );
}
