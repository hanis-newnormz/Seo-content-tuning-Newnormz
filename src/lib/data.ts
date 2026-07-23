import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Annotation,
  ClientShare,
  Comment,
  Page,
  Project,
  ProjectWithStats,
  Recommendation,
} from "@/types/database";

export async function getProjectsWithStats(): Promise<ProjectWithStats[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_stats")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ProjectWithStats[];
}

export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export interface PageWithStats extends Page {
  recommendation_count: number;
  approved_count: number;
}

export async function getPagesForProject(projectId: string): Promise<PageWithStats[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("page_stats")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as PageWithStats[];
}

export async function getPage(pageId: string): Promise<Page | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getRecommendationsForPage(pageId: string): Promise<Recommendation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .eq("page_id", pageId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAnnotationsForPage(pageId: string): Promise<Annotation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("annotations")
    .select("*")
    .eq("page_id", pageId);

  if (error) throw error;
  return data ?? [];
}

export async function getCommentsForRecommendation(
  recommendationId: string,
): Promise<Comment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("recommendation_id", recommendationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getActiveClientShare(projectId: string): Promise<ClientShare | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("client_shares")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getCurrentProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
}
