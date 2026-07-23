"use server";

import { revalidatePath } from "next/cache";

import { DEMO_MODE } from "@/lib/demo/config";
import { insertPage, removePage, setPageScreenshot } from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";

export async function createPage(input: {
  projectId: string;
  pageName: string;
  pageUrl: string;
  screenshotUrl: string | null;
  displayOrder: number;
}) {
  if (DEMO_MODE) {
    insertPage(input);
    revalidatePath(`/projects/${input.projectId}`);
    return;
  }

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
  if (DEMO_MODE) {
    removePage(pageId);
    revalidatePath(`/projects/${projectId}`);
    return;
  }

  const supabase = createClient();
  const { error } = await supabase.from("pages").delete().eq("id", pageId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
}

export async function updatePageScreenshot(projectId: string, pageId: string, screenshotUrl: string) {
  if (DEMO_MODE) {
    setPageScreenshot(pageId, screenshotUrl);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/pages/${pageId}`);
    return;
  }

  const supabase = createClient();
  const { error } = await supabase.from("pages").update({ screenshot_url: screenshotUrl }).eq("id", pageId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/pages/${pageId}`);
}
