import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS, STATUS_LABELS, type RecPriority, type RecStatus } from "@/types/database";
import { cn } from "@/lib/utils";

const PRIORITY_VARIANT: Record<RecPriority, "destructive" | "warning" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
};

export function PriorityBadge({ priority, className }: { priority: RecPriority; className?: string }) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority]} className={cn(className)}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

const STATUS_VARIANT: Record<RecStatus, "secondary" | "success" | "destructive" | "outline"> = {
  draft: "outline",
  sent_to_client: "secondary",
  approved: "success",
  rejected: "destructive",
  implemented: "secondary",
};

export function StatusBadge({ status, className }: { status: RecStatus; className?: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={cn(className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
