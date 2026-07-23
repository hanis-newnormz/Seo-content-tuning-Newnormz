"use server";

import { revalidatePath } from "next/cache";

import { DEMO_MODE } from "@/lib/demo/config";
import { findRecommendationProjectId, insertComment, setRecommendationStatus, store } from "@/lib/demo/store";
import { createServiceRoleClient } from "@/lib/supabase/server";

function assertDemoRecommendationBelongsToProject(recommendationId: string, shareToken: string) {
  const project = store.projects.find((p) => p.share_token === shareToken);
  if (!project) throw new Error("Invalid review link.");
  const projectId = findRecommendationProjectId(recommendationId);
  if (!projectId || projectId !== project.id) throw new Error("Recommendation not found for this project.");
}

async function assertRecommendationBelongsToProject(recommendationId: string, shareToken: string) {
  const supabase = createServiceRoleClient();
  const { data: project } = await supabase.from("projects").select("id").eq("share_token", shareToken).single();
  if (!project) throw new Error("Invalid review link.");

  const { data: rec } = await supabase
    .from("recommendations")
    .select("id, page:pages(project_id)")
    .eq("id", recommendationId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageProjectId = (rec as any)?.page?.project_id;
  if (!rec || pageProjectId !== project.id) throw new Error("Recommendation not found for this project.");

  return supabase;
}

export async function clientSetRecommendationStatus(
  shareToken: string,
  recommendationId: string,
  status: "Approved" | "Rejected"
) {
  if (DEMO_MODE) {
    assertDemoRecommendationBelongsToProject(recommendationId, shareToken);
    setRecommendationStatus(recommendationId, status);
    revalidatePath(`/client/${shareToken}`);
    return;
  }

  const supabase = await assertRecommendationBelongsToProject(recommendationId, shareToken);
  const { error } = await supabase.from("recommendations").update({ status }).eq("id", recommendationId);
  if (error) throw new Error(error.message);
  revalidatePath(`/client/${shareToken}`);
}

export async function clientAddComment(
  shareToken: string,
  recommendationId: string,
  userName: string,
  comment: string
) {
  if (!userName.trim() || !comment.trim()) throw new Error("Please add your name and a comment.");

  if (DEMO_MODE) {
    assertDemoRecommendationBelongsToProject(recommendationId, shareToken);
    insertComment(recommendationId, userName.trim(), comment.trim(), "client");
    revalidatePath(`/client/${shareToken}`);
    return;
  }

  const supabase = await assertRecommendationBelongsToProject(recommendationId, shareToken);
  const { error } = await supabase
    .from("comments")
    .insert({ recommendation_id: recommendationId, user_name: userName.trim(), comment: comment.trim(), author_type: "client" });
  if (error) throw new Error(error.message);
  revalidatePath(`/client/${shareToken}`);
}
