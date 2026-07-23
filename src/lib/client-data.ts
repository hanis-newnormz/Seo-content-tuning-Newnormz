import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Annotation, ClientShare, Comment, Page, Project, Recommendation } from "@/types/database";

export interface ClientReviewPage {
  page: Page;
  recommendations: Recommendation[];
  annotations: Annotation[];
  commentsByRecommendation: Record<string, Comment[]>;
}

export interface ClientReviewData {
  share: ClientShare;
  project: Project;
  pages: ClientReviewPage[];
}

export async function getClientReviewData(token: string): Promise<ClientReviewData | null> {
  const supabase = createServiceRoleClient();

  const { data: share } = await supabase
    .from("client_shares")
    .select("*")
    .eq("token", token)
    .eq("is_active", true)
    .maybeSingle();

  if (!share) return null;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", share.project_id)
    .maybeSingle();

  if (!project) return null;

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("project_id", project.id)
    .order("position", { ascending: true });

  const pageList = pages ?? [];
  const pageIds = pageList.map((p) => p.id);

  const { data: allRecommendations } = pageIds.length
    ? await supabase
        .from("recommendations")
        .select("*")
        .in("page_id", pageIds)
        .order("created_at", { ascending: true })
    : { data: [] };

  const { data: allAnnotations } = pageIds.length
    ? await supabase.from("annotations").select("*").in("page_id", pageIds)
    : { data: [] };

  const recommendationIds = (allRecommendations ?? []).map((r) => r.id);
  const { data: allComments } = recommendationIds.length
    ? await supabase
        .from("comments")
        .select("*")
        .in("recommendation_id", recommendationIds)
        .order("created_at", { ascending: true })
    : { data: [] };

  const commentsByRecommendation: Record<string, Comment[]> = {};
  (allComments ?? []).forEach((c) => {
    if (!commentsByRecommendation[c.recommendation_id]) {
      commentsByRecommendation[c.recommendation_id] = [];
    }
    commentsByRecommendation[c.recommendation_id].push(c);
  });

  const pagesWithData: ClientReviewPage[] = pageList.map((page) => ({
    page,
    recommendations: (allRecommendations ?? []).filter((r) => r.page_id === page.id),
    annotations: (allAnnotations ?? []).filter((a) => a.page_id === page.id),
    commentsByRecommendation,
  }));

  return { share, project, pages: pagesWithData };
}
