"use server";

import { revalidatePath } from "next/cache";

import { createServiceRoleClient } from "@/lib/supabase/server";

async function assertTokenOwnsRecommendation(token: string, recommendationId: string) {
  const supabase = createServiceRoleClient();

  const { data: share } = await supabase
    .from("client_shares")
    .select("project_id, is_active")
    .eq("token", token)
    .maybeSingle();

  if (!share || !share.is_active) {
    throw new Error("This review link is no longer active.");
  }

  const { data: rec } = await supabase
    .from("recommendations")
    .select("id, page_id, pages!inner(project_id)")
    .eq("id", recommendationId)
    .maybeSingle();

  const recProjectId = (rec as unknown as { pages: { project_id: string } } | null)?.pages
    ?.project_id;

  if (!rec || recProjectId !== share.project_id) {
    throw new Error("Recommendation not found for this project.");
  }

  return { supabase, projectId: share.project_id };
}

export async function submitClientDecision(
  token: string,
  recommendationId: string,
  decision: "approved" | "rejected",
) {
  const { supabase, projectId } = await assertTokenOwnsRecommendation(token, recommendationId);

  const { error } = await supabase
    .from("recommendations")
    .update({ status: decision })
    .eq("id", recommendationId);

  if (error) throw error;
  revalidatePath(`/client/${token}`);
  return projectId;
}

export async function submitClientComment(
  token: string,
  recommendationId: string,
  authorName: string,
  comment: string,
) {
  if (!authorName.trim() || !comment.trim()) {
    throw new Error("Name and comment are required.");
  }

  await assertTokenOwnsRecommendation(token, recommendationId);
  const supabase = createServiceRoleClient();

  const { error } = await supabase.from("comments").insert({
    recommendation_id: recommendationId,
    author_name: authorName.trim(),
    author_type: "client",
    comment: comment.trim(),
  });

  if (error) throw error;
  revalidatePath(`/client/${token}`);
}
