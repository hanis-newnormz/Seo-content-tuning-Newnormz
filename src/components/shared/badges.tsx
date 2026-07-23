import { AlertTriangle, ArrowUp, Minus, ArrowDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PRIORITY_BADGE_VARIANT, STATUS_BADGE_VARIANT } from "@/lib/constants";
import type { RecommendationPriority, RecommendationStatus } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

const PRIORITY_ICON: Record<RecommendationPriority, React.ComponentType<{ className?: string }>> = {
  Critical: AlertTriangle,
  High: ArrowUp,
  Medium: Minus,
  Low: ArrowDown,
};

export function PriorityBadge({ priority, className }: { priority: RecommendationPriority; className?: string }) {
  const Icon = PRIORITY_ICON[priority];
  return (
    <Badge variant={PRIORITY_BADGE_VARIANT[priority]} className={cn("gap-1", className)}>
      <Icon className="h-3 w-3" />
      {priority}
    </Badge>
  );
}

export function StatusBadge({ status, className }: { status: RecommendationStatus; className?: string }) {
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]} className={className}>
      {status}
    </Badge>
  );
}

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("bg-secondary/60 font-normal", className)}>
      {category}
    </Badge>
  );
}
