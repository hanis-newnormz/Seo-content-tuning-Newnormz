import { notFound } from "next/navigation";
import { Globe2, Tags } from "lucide-react";

import { AddPageDialog } from "@/app/(app)/projects/[projectId]/add-page-dialog";
import { PagesGrid } from "@/app/(app)/projects/[projectId]/pages-grid";
import { ProjectHeaderActions } from "@/app/(app)/projects/[projectId]/project-header-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProjectWithPages } from "@/lib/data";

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const project = await getProjectWithPages(params.projectId);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">{project.client_name}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{project.project_name}</h1>
          <a
            href={project.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <Globe2 className="h-3.5 w-3.5" />
            {project.website_url}
          </a>
          {project.target_keywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Tags className="h-3.5 w-3.5 text-muted-foreground" />
              {project.target_keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="font-normal">
                  {kw}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <ProjectHeaderActions projectId={project.id} shareToken={project.share_token} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Website pages</h2>
        <AddPageDialog projectId={project.id} nextOrder={project.pages.length} />
      </div>

      {project.pages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="font-medium">No pages added yet</p>
            <p className="text-sm text-muted-foreground">
              Add a website page and upload a screenshot to start the review.
            </p>
            <AddPageDialog projectId={project.id} nextOrder={0} />
          </CardContent>
        </Card>
      ) : (
        <PagesGrid projectId={project.id} pages={project.pages} />
      )}
    </div>
  );
}
