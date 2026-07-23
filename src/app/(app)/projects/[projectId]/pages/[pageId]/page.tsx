import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ReviewWorkspace } from "@/app/(app)/projects/[projectId]/pages/[pageId]/review-workspace";
import { Button } from "@/components/ui/button";
import { getPageWithRecommendations } from "@/lib/data";
import type { Annotation, Comment, Recommendation } from "@/lib/supabase/database.types";

function stripNestedRelations(rec: Recommendation & { annotations: Annotation[]; comments: Comment[] }): Recommendation {
  const rest: Partial<typeof rec> = { ...rec };
  delete rest.annotations;
  delete rest.comments;
  return rest as Recommendation;
}

export default async function PageReviewPage({
  params,
}: {
  params: { projectId: string; pageId: string };
}) {
  const page = await getPageWithRecommendations(params.pageId);
  if (!page || page.project_id !== params.projectId) notFound();

  const annotations = page.recommendations.flatMap((r) => r.annotations);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/projects/${params.projectId}`}>
            <ChevronLeft className="h-4 w-4" />
            {page.project.project_name}
          </Link>
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ReviewWorkspace
          pageId={page.id}
          pageName={page.page_name}
          screenshotUrl={page.screenshot_url}
          initialRecommendations={page.recommendations.map(stripNestedRelations)}
          initialAnnotations={annotations}
        />
      </div>
    </div>
  );
}
