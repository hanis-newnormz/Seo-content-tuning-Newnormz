"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export interface PageActionState {
  error?: string;
}

export async function createPage(
  _prevState: PageActionState,
  formData: FormData,
): Promise<PageActionState> {
  const supabase = createClient();

  const projectId = String(formData.get("project_id") ?? "");
  const pageName = String(formData.get("page_name") ?? "").trim();
  const pageUrl = String(formData.get("page_url") ?? "").trim();
  const screenshot = formData.get("screenshot") as File | null;

  if (!projectId || !pageName || !pageUrl) {
    return { error: "Page name and URL are required." };
  }

  let screenshotUrl: string | null = null;

  if (screenshot && screenshot.size > 0) {
    const uploaded = await uploadScreenshotFile(projectId, screenshot);
    if ("error" in uploaded) return { error: uploaded.error };
    screenshotUrl = uploaded.url;
  }

  const { data: existingPages } = await supabase
    .from("pages")
    .select("position")
    .eq("project_id", projectId)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = (existingPages?.[0]?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("pages")
    .insert({
      project_id: projectId,
      page_name: pageName,
      page_url: pageUrl,
      screenshot_url: screenshotUrl,
      position: nextPosition,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}/pages/${data.id}`);
}

async function uploadScreenshotFile(
  projectId: string,
  file: File,
): Promise<{ url: string } | { error: string }> {
  const supabase = createClient();

  const ext = file.name.split(".").pop() || "png";
  const path = `${projectId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("screenshots")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: `Screenshot upload failed: ${uploadError.message}` };
  }

  const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function replacePageScreenshot(pageId: string, projectId: string, file: File) {
  const uploaded = await uploadScreenshotFile(projectId, file);
  if ("error" in uploaded) throw new Error(uploaded.error);

  const supabase = createClient();
  const { error } = await supabase
    .from("pages")
    .update({ screenshot_url: uploaded.url })
    .eq("id", pageId);

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/pages/${pageId}`);
  return uploaded.url;
}

export async function deletePage(pageId: string, projectId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("pages").delete().eq("id", pageId);
  if (error) throw error;
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}
