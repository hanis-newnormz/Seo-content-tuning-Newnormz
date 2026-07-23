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

const SUGGESTIONS_TOOL: Anthropic.Tool = {
  name: "propose_seo_recommendations",
  description:
    "Propose a set of concrete SEO/content optimization recommendations for the reviewed webpage, grounded in the research just performed.",
  input_schema: {
    type: "object",
    properties: {
      suggestions: {
        type: "array",
        minItems: 3,
        maxItems: 8,
        items: {
          type: "object",
          properties: {
            section_name: {
              type: "string",
              description: "The specific section or element being addressed, e.g. 'Hero Heading'.",
            },
            category: { type: "string", enum: CATEGORY_OPTIONS as unknown as string[] },
            priority: { type: "string", enum: PRIORITY_OPTIONS as unknown as string[] },
            current_content: {
              type: "string",
              description: "The exact current copy/content in that section, verbatim if visible.",
            },
            seo_issue: {
              type: "string",
              description: "The specific SEO or content problem with the current section.",
            },
            recommended_content: {
              type: "string",
              description:
                "The exact replacement copy, written per the mandatory writing rules in the system prompt.",
            },
            seo_reason: {
              type: "string",
              description: "Why this change matters for SEO / search intent / rankings.",
            },
            expected_benefit: {
              type: "string",
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

const RESEARCH_TOOLS: Anthropic.ToolUnion[] = [
  { type: "web_search_20250305", name: "web_search", max_uses: 4 },
  { type: "web_fetch_20250910", name: "web_fetch", max_uses: 4 },
];

// Mandatory ground rules from the agency's SEO content tuning methodology
// (see the `latest-content-tuning` skill) — applied to every recommendation's
// `recommended_content` and `seo_reason` so AI-drafted copy reads exactly like
// what a senior strategist would hand a client.
const GROUND_RULES = `MANDATORY WRITING RULES for "recommended_content" and "seo_reason" — no exceptions:
- Never use an em dash (—). Use a comma, period, or restructure the sentence instead.
- Never use the word "whether".
- Never use the pattern "from X to Y".
- Never use the pattern "at [Brand Name]" — write "[Brand] provides..." or "[Brand]'s team..." instead.
- Never repeat the same keyword phrase twice in one sentence or heading (no keyword stuffing).
- Match tone to the audience and industry (e.g. warm and trustworthy for care/education, confident and
  benefit-first for ecommerce/product).
- Naturally include the location/region in headings or body copy when the client serves a specific area.
- Every heading-level recommendation must incorporate a target keyword naturally, never generic copy.

CTA RULES — use only when a recommendation proposes a call-to-action:
- Service clients (agencies, clinics, schools, B2B, care providers): "Contact Us Today", "Get in Touch",
  "Speak to Our Team", "Enquire Now", "Request a Free Quote", "Book a Consultation".
- Product / ecommerce clients: "Buy Now", "Explore More".
Infer which category the client falls into from its name, URL, and page content.`;

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
  competitorUrl?: string;
}

export async function analyzePageWithAI(input: AnalyzePageInput): Promise<AISuggestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const client = new Anthropic({ apiKey });
  const imageBlock = input.screenshotUrl ? buildImageBlock(input.screenshotUrl) : null;
  const keywordList = input.targetKeywords.length ? input.targetKeywords.join(", ") : "(none provided)";

  const system = `You are a senior SEO content strategist at a digital marketing agency, working through this
agency's established SEO content tuning methodology (research the live client page, benchmark it
against real top-ranking competitor content for the target keywords, then propose specific content
fixes) for its client review platform.

${GROUND_RULES}`;

  const researchBrief = `Client: ${input.clientName}
Page under review: ${input.pageName} — ${input.pageUrl}
Target keywords: ${keywordList}
${input.competitorUrl ? `Direct competitor URL to benchmark against: ${input.competitorUrl}` : ""}

Do this research before proposing anything:
1. Use web_fetch on the client's page URL above to read its actual current, live content (headings, intro
   copy, CTAs). If it can't be fetched, rely on the attached screenshot and this brief instead.
2. Use web_search for the primary target keyword to find how the top-ranking competitor pages currently
   approach this topic — what they cover, how they structure headings, what CTAs they use.
${input.competitorUrl ? "3. Use web_fetch on the direct competitor URL to see exactly what it covers.\n" : ""}
Then summarize, in a few sentences, the concrete content gaps and weaknesses you found in the client's
page versus what's actually working for competitors right now. Be specific — cite what you found, don't
guess.${imageBlock ? " A screenshot of the client page is attached for additional visual context." : ""}`;

  const researchMessage = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    system,
    tools: RESEARCH_TOOLS,
    messages: [
      {
        role: "user",
        content: imageBlock ? [imageBlock, { type: "text", text: researchBrief }] : researchBrief,
      },
    ],
  });

  const finalMessage = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    system,
    tools: [...RESEARCH_TOOLS, SUGGESTIONS_TOOL],
    tool_choice: { type: "tool", name: SUGGESTIONS_TOOL.name },
    messages: [
      {
        role: "user",
        content: imageBlock ? [imageBlock, { type: "text", text: researchBrief }] : researchBrief,
      },
      { role: "assistant", content: researchMessage.content },
      {
        role: "user",
        content:
          "Based on everything you just found, call propose_seo_recommendations now with 3-8 concrete, " +
          "distinct recommendations grounded in that research. Follow the mandatory writing and CTA rules " +
          "exactly for every recommended_content and seo_reason field.",
      },
    ],
  });

  const toolUse = finalMessage.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("The AI did not return structured recommendations. Please try again.");
  }

  const parsed = toolUse.input as { suggestions?: AISuggestion[] };
  return parsed.suggestions ?? [];
}
