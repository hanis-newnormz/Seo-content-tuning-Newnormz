"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function createPage(input: {
  projectId: string;
  pageName: string;
  pageUrl: string;
  screenshotUrl: string | null;
  displayOrder: number;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("pages").insert({
    project_id: input.projectId,
    page_name: input.pageName,
    page_url: input.pageUrl,
    screenshot_url: input.screenshotUrl,
    display_order: input.displayOrder,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${input.projectId}`);
}

export async function deletePage(projectId: string, pageId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("pages").delete().eq("id", pageId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
}

export async function updatePageScreenshot(projectId: string, pageId: string, screenshotUrl: string) {
  const supabase = createClient();
  const { error } = await supabase.from("pages").update({ screenshot_url: screenshotUrl }).eq("id", pageId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/pages/${pageId}`);
}
