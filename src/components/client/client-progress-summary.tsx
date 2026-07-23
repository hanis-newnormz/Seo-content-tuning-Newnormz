import { Progress } from "@/components/ui/progress";

export function ClientProgressSummary({
  total,
  approved,
}: {
  total: number;
  approved: number;
}) {
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium">Review progress</p>
        <p className="text-muted-foreground">
          {approved} of {total} recommendations approved
        </p>
      </div>
      <Progress value={pct} className="mt-3 h-2" />
    </div>
  );
}
