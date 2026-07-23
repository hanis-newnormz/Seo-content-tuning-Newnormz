import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "@/lib/constants";

export interface AISuggestion {
  section_name: string;
  category: (typeof CATEGORY_OPTIONS)[number];
  priority: (typeof PRIORITY_OPTIONS)[number];
  current_content: string;
  seo_issue: string;
  recommended_content: string;
  seo_reason: string;
  expected_benefit: string;
}

const SUGGESTIONS_TOOL = {
  name: "propose_seo_recommendations",
  description:
    "Propose a set of concrete SEO/content optimization recommendations for the reviewed webpage.",
  input_schema: {
    type: "object" as const,
    properties: {
      suggestions: {
        type: "array" as const,
        minItems: 3,
        maxItems: 8,
        items: {
          type: "object" as const,
          properties: {
            section_name: {
              type: "string" as const,
              description: "The specific section or element being addressed, e.g. 'Hero Heading'.",
            },
            category: { type: "string" as const, enum: CATEGORY_OPTIONS as unknown as string[] },
            priority: { type: "string" as const, enum: PRIORITY_OPTIONS as unknown as string[] },
            current_content: {
              type: "string" as const,
              description: "The exact current copy/content in that section, verbatim if visible.",
            },
            seo_issue: {
              type: "string" as const,
              description: "The specific SEO or content problem with the current section.",
            },
            recommended_content: {
              type: "string" as const,
              description: "The exact replacement copy or change recommended.",
            },
            seo_reason: {
              type: "string" as const,
              description: "Why this change matters for SEO / search intent / rankings.",
            },
            expected_benefit: {
              type: "string" as const,
              description: "The concrete, client-facing benefit of making this change.",
            },
          },
          required: [
            "section_name",
            "category",
            "priority",
            "current_content",
            "seo_issue",
            "recommended_content",
            "seo_reason",
            "expected_benefit",
          ],
        },
      },
    },
    required: ["suggestions"],
  },
};

function buildImageBlock(screenshotUrl: string): Anthropic.ImageBlockParam | null {
  const base64Match = screenshotUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,(.+)$/);
  if (base64Match) {
    const [, mediaType, data] = base64Match;
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
        data,
      },
    };
  }

  if (/^https?:\/\//.test(screenshotUrl)) {
    return { type: "image", source: { type: "url", url: screenshotUrl } };
  }

  // Unsupported format for vision (e.g. an SVG data URI) — analysis falls back to text-only context.
  return null;
}

export interface AnalyzePageInput {
  pageName: string;
  pageUrl: string;
  screenshotUrl: string | null;
  clientName: string;
  targetKeywords: string[];
}

export async function analyzePageWithAI(input: AnalyzePageInput): Promise<AISuggestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const client = new Anthropic({ apiKey });
  const imageBlock = input.screenshotUrl ? buildImageBlock(input.screenshotUrl) : null;

  const contextText = `Client: ${input.clientName}
Page: ${input.pageName} (${input.pageUrl})
Target keywords: ${input.targetKeywords.length ? input.targetKeywords.join(", ") : "(none provided)"}

${
  imageBlock
    ? "A screenshot of the current page is attached. Base your recommendations on what is actually visible in the screenshot."
    : "No usable screenshot image is available for this page — base recommendations on the page name, URL, and target keywords only, and keep 'current_content' generic since it cannot be verified visually."
}

You are assisting an SEO agency's content review platform. Propose concrete, specific SEO and content
optimization recommendations for this page, the same way a senior SEO strategist would present them to
a client for approval. Each recommendation must reference a distinct, real section of the page (e.g.
hero heading, subheading, CTA button, meta-relevant intro copy, trust signals, internal links) — do not
propose generic or duplicate recommendations. Ground every recommendation in the target keywords and
what is actually visible in the screenshot when one is provided.`;

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    system:
      "You are an expert SEO content strategist producing recommendation drafts for a client review platform. Always respond by calling the propose_seo_recommendations tool with your findings — never respond in plain text.",
    tools: [SUGGESTIONS_TOOL],
    tool_choice: { type: "tool", name: SUGGESTIONS_TOOL.name },
    messages: [
      {
        role: "user",
        content: imageBlock ? [imageBlock, { type: "text", text: contextText }] : contextText,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("The AI did not return structured recommendations. Please try again.");
  }

  const parsed = toolUse.input as { suggestions?: AISuggestion[] };
  return parsed.suggestions ?? [];
}
