import { ClipboardList } from "lucide-react";

import { NewProjectDialog } from "@/components/dashboard/new-project-dialog";
import { ProjectCard } from "@/components/dashboard/project-card";
import { getProjectsWithStats } from "@/lib/data";

export default async function DashboardPage() {
  const projects = await getProjectsWithStats();

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Review projects</h1>
          <p className="text-sm text-muted-foreground">
            Every client SEO review, in one place — no more slide decks.
          </p>
        </div>
        <NewProjectDialog />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium">No review projects yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first project to start turning website screenshots into
            client-ready SEO recommendations.
          </p>
          <div className="mt-6">
            <NewProjectDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
