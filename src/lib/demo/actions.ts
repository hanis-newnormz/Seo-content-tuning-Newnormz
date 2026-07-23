"use server";

import { revalidatePath } from "next/cache";

import { resetDemoStore } from "@/lib/demo/store";

export async function resetDemoData() {
  resetDemoStore();
  revalidatePath("/", "layout");
}
