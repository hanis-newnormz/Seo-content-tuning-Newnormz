"use server";

import { revalidatePath } from "next/cache";

import { DEMO_MODE } from "@/lib/demo/config";
import {
  editRecommendation,
  insertAnnotation,
  insertComment,
  insertRecommendation,
  moveAnnotation,
  removeAnnotation,
  removeRecommendation,
  setRecommendationStatus,
} from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";
import type {
  RecommendationCategory,
  RecommendationPriority,
  RecommendationStatus,
} from "@/lib/supabase/database.types";

export interface RecommendationInput {
  sectionName: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  currentContent: string;
  seoIssue: string;
  recommendedContent: string;
  seoReason: string;
  expectedBenefit: string;
  status: RecommendationStatus;
}

export async function createRecommendation(pageId: string, input: RecommendationInput) {
  if (DEMO_MODE) return insertRecommendation(pageId, input);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("recommendations")
    .insert({
      page_id: pageId,
      section_name: input.sectionName,
      category: input.category,
      priority: input.priority,
      current_content: input.currentContent || null,
      seo_issue: input.seoIssue,
      recommended_content: input.recommendedContent,
      seo_reason: input.seoReason,
      expected_benefit: input.expectedBenefit || null,
      status: input.status,
      created_by: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateRecommendation(recommendationId: string, input: RecommendationInput) {
  if (DEMO_MODE) return editRecommendation(recommendationId, input);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("recommendations")
    .update({
      section_name: input.sectionName,
      category: input.category,
      priority: input.priority,
      current_content: input.currentContent || null,
      seo_issue: input.seoIssue,
      recommended_content: input.recommendedContent,
      seo_reason: input.seoReason,
      expected_benefit: input.expectedBenefit || null,
      status: input.status,
    })
    .eq("id", recommendationId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateRecommendationStatus(recommendationId: string, status: RecommendationStatus) {
  if (DEMO_MODE) {
    setRecommendationStatus(recommendationId, status);
    return;
  }

  const supabase = createClient();
  const { error } = await supabase.from("recommendations").update({ status }).eq("id", recommendationId);
  if (error) throw new Error(error.message);
}

export async function deleteRecommendation(pageId: string, recommendationId: string) {
  if (DEMO_MODE) {
    removeRecommendation(recommendationId);
    revalidatePath(`/projects`);
    return { pageId };
  }

  const supabase = createClient();
  const { error } = await supabase.from("recommendations").delete().eq("id", recommendationId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects`);
  return { pageId };
}

export async function createAnnotation(input: {
  recommendationId: string;
  pageId: string;
  x: number;
  y: number;
  sectionName: string;
}) {
  if (DEMO_MODE) return insertAnnotation(input);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("annotations")
    .insert({
      recommendation_id: input.recommendationId,
      page_id: input.pageId,
      x_position: input.x,
      y_position: input.y,
      section_name: input.sectionName,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAnnotationPosition(annotationId: string, x: number, y: number) {
  if (DEMO_MODE) {
    moveAnnotation(annotationId, x, y);
    return;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("annotations")
    .update({ x_position: x, y_position: y })
    .eq("id", annotationId);
  if (error) throw new Error(error.message);
}

export async function deleteAnnotation(annotationId: string) {
  if (DEMO_MODE) {
    removeAnnotation(annotationId);
    return;
  }

  const supabase = createClient();
  const { error } = await supabase.from("annotations").delete().eq("id", annotationId);
  if (error) throw new Error(error.message);
}

export async function addAgencyComment(recommendationId: string, userName: string, comment: string) {
  if (DEMO_MODE) return insertComment(recommendationId, userName, comment, "agency");

  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({ recommendation_id: recommendationId, user_name: userName, comment, author_type: "agency" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
