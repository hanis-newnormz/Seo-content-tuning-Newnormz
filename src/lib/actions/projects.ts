"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { ProjectStatus } from "@/types/database";

export interface ProjectActionState {
  error?: string;
}

export async function createProject(
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const clientName = String(formData.get("client_name") ?? "").trim();
  const websiteUrl = String(formData.get("website_url") ?? "").trim();
  const projectName = String(formData.get("project_name") ?? "").trim();
  const keywordsRaw = String(formData.get("target_keywords") ?? "");
  const targetKeywords = keywordsRaw
    .split("\n")
    .map((k) => k.trim())
    .filter(Boolean);

  if (!clientName || !websiteUrl || !projectName) {
    return { error: "Client, website, and project name are required." };
  }

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

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  const supabase = createClient();
  const { error } = await supabase.from("projects").update({ status }).eq("id", projectId);
  if (error) throw error;
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}

export async function deleteProject(projectId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function getOrCreateClientShare(projectId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existing } = await supabase
    .from("client_shares")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (existing) return existing;

  const token = randomBytes(20).toString("hex");
  const { data, error } = await supabase
    .from("client_shares")
    .insert({ project_id: projectId, token, created_by: user?.id ?? null })
    .select("*")
    .single();

  if (error) throw error;
  revalidatePath(`/projects/${projectId}`);
  return data;
}
