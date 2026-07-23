import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ExportReportButton } from "@/components/projects/export-report-button";
import { NewPageDialog } from "@/components/projects/new-page-dialog";
import { PageCard } from "@/components/projects/page-card";
import { ShareLinkButton } from "@/components/projects/share-link-button";
import { getActiveClientShare, getPagesForProject, getProject } from "@/lib/data";

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const [project, pages, share] = await Promise.all([
    getProject(params.projectId),
    getPagesForProject(params.projectId),
    getActiveClientShare(params.projectId),
  ]);

  if (!project) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {project.client_name}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{project.project_name}</h1>
          <Link
            href={project.website_url}
            target="_blank"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {project.website_url}
          </Link>
          {project.target_keywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Tags className="h-3.5 w-3.5 text-muted-foreground" />
              {project.target_keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="font-normal">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <ShareLinkButton
            projectId={project.id}
            existingToken={share?.token}
            appUrl={appUrl}
          />
          <ExportReportButton projectId={project.id} />
          <NewPageDialog projectId={project.id} />
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <h2 className="text-lg font-medium">No pages added yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add the first page and upload a screenshot to start pinning SEO recommendations.
          </p>
          <div className="mt-6">
            <NewPageDialog projectId={project.id} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <PageCard key={page.id} page={page} projectId={project.id} />
          ))}
        </div>
      )}
    </div>
  );
}
