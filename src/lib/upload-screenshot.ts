import { DEMO_MODE } from "@/lib/demo/config";
import { createClient } from "@/lib/supabase/client";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export async function uploadScreenshot(projectId: string, file: File): Promise<string> {
  if (DEMO_MODE) {
    return fileToDataUrl(file);
  }

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
