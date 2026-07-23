import { createClient } from "@/lib/supabase/client";

export async function uploadScreenshot(projectId: string, file: File): Promise<string> {
  const supabase = createClient();
  const extension = file.name.split(".").pop() || "png";
  const path = `${projectId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("screenshots").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
  return data.publicUrl;
}
