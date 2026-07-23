import Link from "next/link";
import { ExternalLink, FileStack, ListChecks } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { ProjectWithStats } from "@/types/database";

const STATUS_VARIANT: Record<string, "secondary" | "success" | "outline"> = {
  active: "secondary",
  completed: "success",
  archived: "outline",
};

export function ProjectCard({ project }: { project: ProjectWithStats }) {
  const approvalPct =
    project.recommendation_count > 0
      ? Math.round((project.approved_count / project.recommendation_count) * 100)
      : 0;

  let hostname = project.website_url;
  try {
    hostname = new URL(project.website_url).hostname;
  } catch {
    // keep raw value if it isn't a valid URL yet
  }

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {project.client_name}
              </p>
              <h3 className="truncate text-base font-semibold">{project.project_name}</h3>
            </div>
            <Badge variant={STATUS_VARIANT[project.status] ?? "secondary"} className="shrink-0 capitalize">
              {project.status}
            </Badge>
          </div>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <ExternalLink className="h-3 w-3 shrink-0" />
            {hostname}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FileStack className="h-4 w-4" />
              {project.page_count} {project.page_count === 1 ? "page" : "pages"}
            </span>
            <span className="flex items-center gap-1.5">
              <ListChecks className="h-4 w-4" />
              {project.recommendation_count} recs
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                Approved {project.approved_count}/{project.recommendation_count}
              </span>
              <span className="text-muted-foreground">{approvalPct}%</span>
            </div>
            <Progress value={approvalPct} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
