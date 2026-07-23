import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PageWithStats } from "@/lib/data";

export function PageCard({
  page,
  projectId,
}: {
  page: PageWithStats;
  projectId: string;
}) {
  const approvalPct =
    page.recommendation_count > 0
      ? Math.round((page.approved_count / page.recommendation_count) * 100)
      : 0;

  return (
    <Link href={`/projects/${projectId}/pages/${page.id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-elevated">
        <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-muted">
          {page.screenshot_url ? (
            <Image
              src={page.screenshot_url}
              alt={`${page.page_name} screenshot`}
              fill
              className="object-cover object-top transition-transform group-hover:scale-[1.02]"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="h-6 w-6" />
              <span className="text-xs">No screenshot yet</span>
            </div>
          )}
        </div>
        <CardContent className="space-y-3 pt-4">
          <div>
            <h3 className="truncate font-semibold">{page.page_name}</h3>
            <p className="truncate text-xs text-muted-foreground">{page.page_url}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">
                {page.recommendation_count} recommendation
                {page.recommendation_count === 1 ? "" : "s"}
              </span>
              <span className="text-muted-foreground">
                {page.approved_count}/{page.recommendation_count} approved
              </span>
            </div>
            <Progress value={approvalPct} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
