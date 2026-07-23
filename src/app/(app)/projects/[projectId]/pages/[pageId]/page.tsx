import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { DeletePageButton } from "@/components/projects/delete-page-button";
import { ReplaceScreenshotButton } from "@/components/projects/replace-screenshot-button";
import { ReviewWorkspace } from "@/components/review/review-workspace";
import {
  getAnnotationsForPage,
  getCommentsForRecommendation,
  getPage,
  getProject,
  getRecommendationsForPage,
} from "@/lib/data";
import type { Comment } from "@/types/database";

export default async function PageReviewPage({
  params,
}: {
  params: { projectId: string; pageId: string };
}) {
  const page = await getPage(params.pageId);
  if (!page || page.project_id !== params.projectId) notFound();

  const [project, recommendations, annotations] = await Promise.all([
    getProject(params.projectId),
    getRecommendationsForPage(params.pageId),
    getAnnotationsForPage(params.pageId),
  ]);

  if (!project) notFound();

  const commentLists = await Promise.all(
    recommendations.map((rec) => getCommentsForRecommendation(rec.id)),
  );
  const commentsByRecommendation: Record<string, Comment[]> = {};
  recommendations.forEach((rec, i) => {
    commentsByRecommendation[rec.id] = commentLists[i];
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${project.id}`}
          className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {project.project_name}
        </Link>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{page.page_name}</h1>
            <Link
              href={page.page_url}
              target="_blank"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {page.page_url}
            </Link>
          </div>
          <div className="flex gap-2">
            <ReplaceScreenshotButton pageId={page.id} projectId={project.id} />
            <DeletePageButton pageId={page.id} projectId={project.id} />
          </div>
        </div>
      </div>

      <ReviewWorkspace
        page={page}
        recommendations={recommendations}
        annotations={annotations}
        commentsByRecommendation={commentsByRecommendation}
      />
    </div>
  );
}
