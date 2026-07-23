"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { RecCategory, RecPriority, RecStatus } from "@/types/database";

export interface RecommendationInput {
  page_id: string;
  section_name: string;
  category: RecCategory;
  priority: RecPriority;
  current_content: string;
  recommended_content: string;
  seo_reason: string;
  internal_notes?: string;
  status: RecStatus;
}

async function revalidatePageViews(pageId: string) {
  const supabase = createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("project_id")
    .eq("id", pageId)
    .maybeSingle();

  revalidatePath(`/projects/${page?.project_id}/pages/${pageId}`);
  if (page?.project_id) revalidatePath(`/projects/${page.project_id}`);
}

export async function createRecommendation(input: RecommendationInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("recommendations")
    .insert({ ...input, created_by: user?.id ?? null })
    .select("*")
    .single();

  if (error) throw error;
  await revalidatePageViews(input.page_id);
  return data;
}

export async function updateRecommendation(
  recommendationId: string,
  input: Partial<RecommendationInput>,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recommendations")
    .update(input)
    .eq("id", recommendationId)
    .select("*")
    .single();

  if (error) throw error;
  await revalidatePageViews(data.page_id);
  return data;
}

export async function updateRecommendationStatus(recommendationId: string, status: RecStatus) {
  return updateRecommendation(recommendationId, { status });
}

export async function deleteRecommendation(recommendationId: string, pageId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("recommendations").delete().eq("id", recommendationId);
  if (error) throw error;
  await revalidatePageViews(pageId);
}

export async function addAgencyComment(recommendationId: string, comment: string) {
  const supabase = createClient();
  const profile = await supabase.auth.getUser();
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", profile.data.user?.id ?? "")
    .maybeSingle();

  const { data: rec } = await supabase
    .from("recommendations")
    .select("page_id")
    .eq("id", recommendationId)
    .maybeSingle();

  const { error } = await supabase.from("comments").insert({
    recommendation_id: recommendationId,
    author_name: profileRow?.full_name || profileRow?.email || "Agency team",
    author_type: "agency",
    comment,
  });

  if (error) throw error;
  if (rec?.page_id) await revalidatePageViews(rec.page_id);
}
