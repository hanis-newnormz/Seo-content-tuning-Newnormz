"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function revalidatePageView(pageId: string) {
  const supabase = createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("project_id")
    .eq("id", pageId)
    .maybeSingle();
  if (page?.project_id) revalidatePath(`/projects/${page.project_id}/pages/${pageId}`);
}

export async function createAnnotation(
  pageId: string,
  recommendationId: string,
  xPosition: number,
  yPosition: number,
  label?: string,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("annotations")
    .insert({
      page_id: pageId,
      recommendation_id: recommendationId,
      x_position: xPosition,
      y_position: yPosition,
      label: label ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  await revalidatePageView(pageId);
  return data;
}

export async function updateAnnotationPosition(
  annotationId: string,
  pageId: string,
  xPosition: number,
  yPosition: number,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("annotations")
    .update({ x_position: xPosition, y_position: yPosition })
    .eq("id", annotationId);

  if (error) throw error;
  await revalidatePageView(pageId);
}

export async function deleteAnnotation(annotationId: string, pageId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("annotations").delete().eq("id", annotationId);
  if (error) throw error;
  await revalidatePageView(pageId);
}
