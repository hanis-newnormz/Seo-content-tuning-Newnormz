"use server";

import { analyzePageWithAI, type AISuggestion } from "@/lib/ai/analyze-page";
import { getPageWithRecommendations } from "@/lib/data";

export async function analyzePage(pageId: string): Promise<AISuggestion[]> {
  const page = await getPageWithRecommendations(pageId);
  if (!page) throw new Error("Page not found.");

  return analyzePageWithAI({
    pageName: page.page_name,
    pageUrl: page.page_url,
    screenshotUrl: page.screenshot_url,
    clientName: page.project.client_name,
    targetKeywords: page.project.target_keywords,
  });
}
