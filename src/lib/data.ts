import "server-only";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type {
  Annotation,
  Comment,
  Page,
  Project,
  Recommendation,
  RecommendationStatus,
} from "@/lib/supabase/database.types";

export interface ProjectWithStats extends Project {
  pageCount: number;
  recommendationCount: number;
  approvedCount: number;
}

type ProjectPagesEmbed = Project & {
  pages: { id: string; recommendations: { id: string; status: RecommendationStatus }[] }[];
};

export async function getProjectsWithStats(): Promise<ProjectWithStats[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, pages(id, recommendations(id, status))")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as ProjectPagesEmbed[];

  return rows.map(({ pages, ...project }) => {
    const recommendations = pages.flatMap((p) => p.recommendations ?? []);
    return {
      ...project,
      pageCount: pages.length,
      recommendationCount: recommendations.length,
      approvedCount: recommendations.filter((r) => r.status === "Approved").length,
    };
  });
}

export interface ProjectWithPages extends Project {
  pages: (Page & { recommendationCount: number; approvedCount: number })[];
}

type PageRecommendationsEmbed = Page & { recommendations: { id: string; status: RecommendationStatus }[] };

export async function getProjectWithPages(projectId: string): Promise<ProjectWithPages | null> {
  const supabase = createClient();
  const { data: project, error } = await supabase.from("projects").select("*").eq("id", projectId).single();
  if (error || !project) return null;

  const { data: pages } = await supabase
    .from("pages")
    .select("*, recommendations(id, status)")
    .eq("project_id", projectId)
    .order("display_order", { ascending: true });

  const rows = (pages ?? []) as unknown as PageRecommendationsEmbed[];

  return {
    ...project,
    pages: rows.map(({ recommendations, ...page }) => ({
      ...page,
      recommendationCount: recommendations.length,
      approvedCount: recommendations.filter((r) => r.status === "Approved").length,
    })),
  };
}

export interface PageWithRecommendations extends Page {
  project: Project;
  recommendations: (Recommendation & { annotations: Annotation[]; comments: Comment[] })[];
}

type PageWithProjectEmbed = Page & { project: Project };

export async function getPageWithRecommendations(pageId: string): Promise<PageWithRecommendations | null> {
  const supabase = createClient();
  const { data: page, error } = await supabase
    .from("pages")
    .select("*, project:projects(*)")
    .eq("id", pageId)
    .single();

  if (error || !page) return null;

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*, annotations(*), comments(*)")
    .eq("page_id", pageId)
    .order("created_at", { ascending: true });

  const typedPage = page as unknown as PageWithProjectEmbed;

  return {
    ...typedPage,
    recommendations: (recommendations ?? []) as unknown as PageWithRecommendations["recommendations"],
  };
}

export interface ProjectForExport {
  project: Project;
  pages: (Page & { recommendations: Recommendation[] })[];
}

export async function getProjectForExport(projectId: string): Promise<ProjectForExport | null> {
  const supabase = createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", projectId).single();
  if (!project) return null;

  const { data: pages } = await supabase
    .from("pages")
    .select("*, recommendations(*)")
    .eq("project_id", projectId)
    .order("display_order", { ascending: true });

  return { project, pages: (pages ?? []) as unknown as ProjectForExport["pages"] };
}

export interface ProjectByShareToken {
  project: Project;
  pages: (Page & { recommendations: (Recommendation & { annotations: Annotation[]; comments: Comment[] })[] })[];
}

export async function getProjectByShareToken(shareToken: string): Promise<ProjectByShareToken | null> {
  const supabase = createServiceRoleClient();
  const { data: project } = await supabase.from("projects").select("*").eq("share_token", shareToken).single();
  if (!project) return null;

  const { data: pages } = await supabase
    .from("pages")
    .select("*, recommendations(*, annotations(*), comments(*))")
    .eq("project_id", project.id)
    .order("display_order", { ascending: true });

  return { project, pages: (pages ?? []) as unknown as ProjectByShareToken["pages"] };
}
