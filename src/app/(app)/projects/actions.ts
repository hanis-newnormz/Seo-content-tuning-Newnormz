"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export interface ProjectActionState {
  error: string | null;
}

export async function createProject(
  _prevState: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const clientName = String(formData.get("clientName") ?? "").trim();
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const projectName = String(formData.get("projectName") ?? "").trim();
  const keywordsRaw = String(formData.get("targetKeywords") ?? "");

  if (!clientName || !websiteUrl || !projectName) {
    return { error: "Client name, website, and project name are required." };
  }

  const targetKeywords = keywordsRaw
    .split("\n")
    .map((k) => k.trim())
    .filter(Boolean);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      client_name: clientName,
      website_url: websiteUrl,
      project_name: projectName,
      target_keywords: targetKeywords,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect(`/projects/${data.id}`);
}

export async function deleteProject(projectId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
