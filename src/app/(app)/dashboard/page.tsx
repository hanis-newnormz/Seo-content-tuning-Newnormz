import Link from "next/link";
import { FolderKanban, Globe2, ListChecks } from "lucide-react";

import { NewProjectDialog } from "@/app/(app)/projects/new-project-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getProjectsWithStats } from "@/lib/data";

export default async function DashboardPage() {
  const projects = await getProjectsWithStats();

  const totals = projects.reduce(
    (acc, p) => {
      acc.pages += p.pageCount;
      acc.recommendations += p.recommendationCount;
      acc.approved += p.approvedCount;
      return acc;
    },
    { pages: 0, recommendations: 0, approved: 0 }
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Review Projects</h1>
          <p className="text-sm text-muted-foreground">
            Every client&apos;s SEO content review, in one presentation-ready workspace.
          </p>
        </div>
        <NewProjectDialog />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={FolderKanban} label="Active projects" value={projects.length} />
        <SummaryCard icon={Globe2} label="Pages reviewed" value={totals.pages} />
        <SummaryCard
          icon={ListChecks}
          label="Recommendations approved"
          value={`${totals.approved}/${totals.recommendations}`}
        />
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <FolderKanban className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-medium">No review projects yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first project to start replacing PowerPoint decks with live reviews.
              </p>
            </div>
            <NewProjectDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const progress = project.recommendationCount
              ? Math.round((project.approvedCount / project.recommendationCount) * 100)
              : 0;
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full transition-shadow hover:shadow-popover">
                  <CardHeader className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                      {project.client_name}
                    </p>
                    <h3 className="text-lg font-semibold leading-tight">{project.project_name}</h3>
                    <p className="truncate text-xs text-muted-foreground">{project.website_url}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{project.pageCount} pages reviewed</span>
                      <span className="text-muted-foreground">{project.recommendationCount} recommendations</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Approval progress</span>
                        <span className="text-muted-foreground">
                          {project.approvedCount}/{project.recommendationCount}
                        </span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Icon className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
