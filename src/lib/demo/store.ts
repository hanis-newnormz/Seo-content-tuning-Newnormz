import "server-only";

import {
  CAFE_HOMEPAGE_SCREENSHOT,
  SCHOOL_ABOUT_SCREENSHOT,
  SCHOOL_HOMEPAGE_SCREENSHOT,
} from "@/lib/demo/mock-screenshots";
import type {
  Annotation,
  Comment,
  CommentAuthorType,
  Page,
  Project,
  Recommendation,
  RecommendationCategory,
  RecommendationPriority,
  RecommendationStatus,
} from "@/lib/supabase/database.types";

interface DemoStore {
  projects: Project[];
  pages: Page[];
  recommendations: Recommendation[];
  annotations: Annotation[];
  comments: Comment[];
}

function id() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

function buildInitialStore(): DemoStore {
  const schoolProjectId = "11111111-1111-4111-8111-111111111111";
  const cafeProjectId = "22222222-2222-4222-8222-222222222222";

  const homepageId = "aaaaaaaa-0000-4000-8000-000000000001";
  const aboutId = "aaaaaaaa-0000-4000-8000-000000000002";
  const cafeHomeId = "bbbbbbbb-0000-4000-8000-000000000001";

  const projects: Project[] = [
    {
      id: schoolProjectId,
      client_name: "ABC International School",
      website_url: "https://www.abcinternationalschool.edu.my",
      project_name: "Homepage Content Optimization",
      target_keywords: ["international school Malaysia", "best international school Kuala Lumpur"],
      share_token: "demo-school-review",
      created_by: null,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: cafeProjectId,
      client_name: "Sunrise Café",
      website_url: "https://sunrisecafe.example.com",
      project_name: "Local SEO Content Refresh",
      target_keywords: ["cafe in bangsar", "best coffee kuala lumpur"],
      share_token: "demo-cafe-review",
      created_by: null,
      created_at: now(),
      updated_at: now(),
    },
  ];

  const pages: Page[] = [
    {
      id: homepageId,
      project_id: schoolProjectId,
      page_name: "Homepage",
      page_url: "https://www.abcinternationalschool.edu.my",
      screenshot_url: SCHOOL_HOMEPAGE_SCREENSHOT,
      display_order: 0,
      created_at: now(),
    },
    {
      id: aboutId,
      project_id: schoolProjectId,
      page_name: "About Us",
      page_url: "https://www.abcinternationalschool.edu.my/about",
      screenshot_url: SCHOOL_ABOUT_SCREENSHOT,
      display_order: 1,
      created_at: now(),
    },
    {
      id: cafeHomeId,
      project_id: cafeProjectId,
      page_name: "Homepage",
      page_url: "https://sunrisecafe.example.com",
      screenshot_url: CAFE_HOMEPAGE_SCREENSHOT,
      display_order: 0,
      created_at: now(),
    },
  ];

  function rec(
    partial: Pick<
      Recommendation,
      | "id"
      | "page_id"
      | "section_name"
      | "category"
      | "priority"
      | "current_content"
      | "seo_issue"
      | "recommended_content"
      | "seo_reason"
      | "expected_benefit"
      | "status"
    >
  ): Recommendation {
    return { ...partial, created_by: null, created_at: now(), updated_at: now() };
  }

  const recHeroId = "cccccccc-0000-4000-8000-000000000001";
  const recIntroId = "cccccccc-0000-4000-8000-000000000002";
  const recCtaId = "cccccccc-0000-4000-8000-000000000003";
  const recLinkingId = "cccccccc-0000-4000-8000-000000000004";
  const recAboutTitleId = "cccccccc-0000-4000-8000-000000000005";
  const recTeamId = "cccccccc-0000-4000-8000-000000000006";
  const recCafeHeroId = "dddddddd-0000-4000-8000-000000000001";
  const recCafeCtaId = "dddddddd-0000-4000-8000-000000000002";

  const recommendations: Recommendation[] = [
    rec({
      id: recHeroId,
      page_id: homepageId,
      section_name: "Hero Heading",
      category: "Content Optimization",
      priority: "Critical",
      current_content: "Welcome to ABC School",
      seo_issue: "The heading does not clearly communicate the school's location or offering.",
      recommended_content: "Leading International School in Kuala Lumpur Offering World-Class Education",
      seo_reason: "Improves search relevance and helps users immediately understand the service.",
      expected_benefit: "Higher click-through from search results and a clearer first impression.",
      status: "Sent to Client",
    }),
    rec({
      id: recIntroId,
      page_id: homepageId,
      section_name: "Hero Subheading",
      category: "Keyword Optimization",
      priority: "High",
      current_content: "We provide quality education.",
      seo_issue: "Current copy is vague and does not include target keywords or specifics.",
      recommended_content:
        "ABC International School provides Cambridge curriculum education in Kuala Lumpur for students aged 3–18.",
      seo_reason: "Adds primary keywords and concrete details that match search intent.",
      expected_benefit: "Better keyword relevance for 'international school Malaysia' searches.",
      status: "Approved",
    }),
    rec({
      id: recCtaId,
      page_id: homepageId,
      section_name: "Hero CTA Button",
      category: "Conversion Optimization",
      priority: "Medium",
      current_content: "Learn More",
      seo_issue: "The generic CTA does not drive action or communicate value.",
      recommended_content: "Book a Campus Tour Today",
      seo_reason: "Action-oriented CTAs increase conversion rate for enrollment enquiries.",
      expected_benefit: "More qualified enquiries from homepage visitors.",
      status: "Draft",
    }),
    rec({
      id: recLinkingId,
      page_id: homepageId,
      section_name: "Footer Links",
      category: "Internal Linking",
      priority: "Low",
      current_content: "Home · Contact",
      seo_issue: "Footer is missing links to key admissions and academics pages.",
      recommended_content: "Add footer links to Admissions, Academics, and Campus Tour pages.",
      seo_reason: "Improves internal link equity and crawlability of priority pages.",
      expected_benefit: "Better indexing and discovery of high-value pages.",
      status: "Rejected",
    }),
    rec({
      id: recAboutTitleId,
      page_id: aboutId,
      section_name: "Page Title",
      category: "EEAT",
      priority: "High",
      current_content: "About Us",
      seo_issue: "Title does not build authority or include trust or location signals.",
      recommended_content: "About ABC International School — 20 Years of Educational Excellence in KL",
      seo_reason: "Establishes credibility and includes a location keyword for relevance.",
      expected_benefit: "Stronger trust signal and improved rankings for branded + local queries.",
      status: "Sent to Client",
    }),
    rec({
      id: recTeamId,
      page_id: aboutId,
      section_name: "Leadership Team Section",
      category: "UX Improvement",
      priority: "Medium",
      current_content: "Name and title only, no bios.",
      seo_issue: "Leadership profiles lack credentials, which weakens trust for prospective parents.",
      recommended_content: "Add a 2–3 sentence bio with qualifications and experience for each leader.",
      seo_reason: "Detailed E-E-A-T signals help both search engines and parents evaluate credibility.",
      expected_benefit: "Increased parent confidence and stronger topical authority.",
      status: "Draft",
    }),
    rec({
      id: recCafeHeroId,
      page_id: cafeHomeId,
      section_name: "Hero Heading",
      category: "Search Intent",
      priority: "High",
      current_content: "Good Coffee, Good Mood",
      seo_issue: "Heading has no location or product keywords, offering little search relevance.",
      recommended_content: "Best Specialty Coffee in Bangsar, Kuala Lumpur",
      seo_reason: "Aligns the headline with how local customers actually search.",
      expected_benefit: "Improved visibility for 'cafe in bangsar' style local searches.",
      status: "Approved",
    }),
    rec({
      id: recCafeCtaId,
      page_id: cafeHomeId,
      section_name: "Locations Section",
      category: "Content Optimization",
      priority: "Medium",
      current_content: "Bangsar — Open daily, 8am–6pm",
      seo_issue: "Missing address, map, and neighbourhood keywords reduces local search relevance.",
      recommended_content:
        "Bangsar, Kuala Lumpur — 12 Jalan Telawi 3. Open daily 8am–6pm. 2 minutes from Bangsar LRT.",
      seo_reason: "Full address and landmark references improve local pack and maps visibility.",
      expected_benefit: "Higher ranking in 'near me' and local map searches.",
      status: "Sent to Client",
    }),
  ];

  const annotations: Annotation[] = [
    { id: id(), recommendation_id: recHeroId, page_id: homepageId, x_position: 50, y_position: 30, section_name: "Hero Heading", created_at: now() },
    { id: id(), recommendation_id: recIntroId, page_id: homepageId, x_position: 50, y_position: 36, section_name: "Hero Subheading", created_at: now() },
    { id: id(), recommendation_id: recCtaId, page_id: homepageId, x_position: 50, y_position: 44, section_name: "Hero CTA Button", created_at: now() },
    { id: id(), recommendation_id: recAboutTitleId, page_id: aboutId, x_position: 20, y_position: 21, section_name: "Page Title", created_at: now() },
    { id: id(), recommendation_id: recTeamId, page_id: aboutId, x_position: 50, y_position: 57, section_name: "Leadership Team Section", created_at: now() },
    { id: id(), recommendation_id: recCafeHeroId, page_id: cafeHomeId, x_position: 50, y_position: 30, section_name: "Hero Heading", created_at: now() },
  ];

  const comments: Comment[] = [
    {
      id: id(),
      recommendation_id: recHeroId,
      user_name: "Mrs. Tan (Marketing, ABC School)",
      author_type: "client",
      comment: "Love this direction — can we also work in \"Cambridge curriculum\" somewhere near the top?",
      created_at: now(),
    },
    {
      id: id(),
      recommendation_id: recHeroId,
      user_name: "Alex Rivera (SEO Agency)",
      author_type: "agency",
      comment: "Good call — we've added that into the hero subheading recommendation below.",
      created_at: now(),
    },
  ];

  return { projects, pages, recommendations, annotations, comments };
}

const globalForDemoStore = globalThis as unknown as { __demoStore?: DemoStore };

export const store: DemoStore = globalForDemoStore.__demoStore ?? buildInitialStore();

if (process.env.NODE_ENV !== "production") {
  globalForDemoStore.__demoStore = store;
}

export function resetDemoStore() {
  const fresh = buildInitialStore();
  store.projects = fresh.projects;
  store.pages = fresh.pages;
  store.recommendations = fresh.recommendations;
  store.annotations = fresh.annotations;
  store.comments = fresh.comments;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export function listProjectsWithStats() {
  return store.projects
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((project) => {
      const projectPages = store.pages.filter((p) => p.project_id === project.id);
      const pageIds = new Set(projectPages.map((p) => p.id));
      const recs = store.recommendations.filter((r) => pageIds.has(r.page_id));
      return {
        ...project,
        pageCount: projectPages.length,
        recommendationCount: recs.length,
        approvedCount: recs.filter((r) => r.status === "Approved").length,
      };
    });
}

export function getProject(projectId: string): Project | null {
  return store.projects.find((p) => p.id === projectId) ?? null;
}

export function getProjectWithPagesData(projectId: string) {
  const project = getProject(projectId);
  if (!project) return null;

  const pages = store.pages
    .filter((p) => p.project_id === projectId)
    .sort((a, b) => a.display_order - b.display_order)
    .map((page) => {
      const recs = store.recommendations.filter((r) => r.page_id === page.id);
      return {
        ...page,
        recommendationCount: recs.length,
        approvedCount: recs.filter((r) => r.status === "Approved").length,
      };
    });

  return { ...project, pages };
}

export function getPageWithRecommendationsData(pageId: string) {
  const page = store.pages.find((p) => p.id === pageId);
  if (!page) return null;
  const project = getProject(page.project_id);
  if (!project) return null;

  const recommendations = store.recommendations
    .filter((r) => r.page_id === pageId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((r) => ({
      ...r,
      annotations: store.annotations.filter((a) => a.recommendation_id === r.id),
      comments: store.comments.filter((c) => c.recommendation_id === r.id),
    }));

  return { ...page, project, recommendations };
}

export function getProjectForExportData(projectId: string) {
  const project = getProject(projectId);
  if (!project) return null;

  const pages = store.pages
    .filter((p) => p.project_id === projectId)
    .sort((a, b) => a.display_order - b.display_order)
    .map((page) => ({
      ...page,
      recommendations: store.recommendations.filter((r) => r.page_id === page.id),
    }));

  return { project, pages };
}

export function getProjectByShareTokenData(shareToken: string) {
  const project = store.projects.find((p) => p.share_token === shareToken);
  if (!project) return null;

  const pages = store.pages
    .filter((p) => p.project_id === project.id)
    .sort((a, b) => a.display_order - b.display_order)
    .map((page) => ({
      ...page,
      recommendations: store.recommendations
        .filter((r) => r.page_id === page.id)
        .map((r) => ({
          ...r,
          annotations: store.annotations.filter((a) => a.recommendation_id === r.id),
          comments: store.comments.filter((c) => c.recommendation_id === r.id),
        })),
    }));

  return { project, pages };
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export function insertProject(input: {
  clientName: string;
  websiteUrl: string;
  projectName: string;
  targetKeywords: string[];
}): Project {
  const project: Project = {
    id: id(),
    client_name: input.clientName,
    website_url: input.websiteUrl,
    project_name: input.projectName,
    target_keywords: input.targetKeywords,
    share_token: id(),
    created_by: null,
    created_at: now(),
    updated_at: now(),
  };
  store.projects.push(project);
  return project;
}

export function removeProject(projectId: string) {
  const pageIds = new Set(store.pages.filter((p) => p.project_id === projectId).map((p) => p.id));
  const recIds = new Set(store.recommendations.filter((r) => pageIds.has(r.page_id)).map((r) => r.id));
  store.projects = store.projects.filter((p) => p.id !== projectId);
  store.pages = store.pages.filter((p) => p.project_id !== projectId);
  store.recommendations = store.recommendations.filter((r) => !recIds.has(r.id));
  store.annotations = store.annotations.filter((a) => !pageIds.has(a.page_id));
  store.comments = store.comments.filter((c) => !recIds.has(c.recommendation_id));
}

export function insertPage(input: {
  projectId: string;
  pageName: string;
  pageUrl: string;
  screenshotUrl: string | null;
  displayOrder: number;
}): Page {
  const page: Page = {
    id: id(),
    project_id: input.projectId,
    page_name: input.pageName,
    page_url: input.pageUrl,
    screenshot_url: input.screenshotUrl,
    display_order: input.displayOrder,
    created_at: now(),
  };
  store.pages.push(page);
  return page;
}

export function removePage(pageId: string) {
  const recIds = new Set(store.recommendations.filter((r) => r.page_id === pageId).map((r) => r.id));
  store.pages = store.pages.filter((p) => p.id !== pageId);
  store.recommendations = store.recommendations.filter((r) => r.page_id !== pageId);
  store.annotations = store.annotations.filter((a) => a.page_id !== pageId);
  store.comments = store.comments.filter((c) => !recIds.has(c.recommendation_id));
}

export function setPageScreenshot(pageId: string, screenshotUrl: string) {
  const page = store.pages.find((p) => p.id === pageId);
  if (page) page.screenshot_url = screenshotUrl;
}

export interface RecommendationFields {
  sectionName: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  currentContent: string;
  seoIssue: string;
  recommendedContent: string;
  seoReason: string;
  expectedBenefit: string;
  status: RecommendationStatus;
}

export function insertRecommendation(pageId: string, input: RecommendationFields): Recommendation {
  const recommendation: Recommendation = {
    id: id(),
    page_id: pageId,
    section_name: input.sectionName,
    category: input.category,
    priority: input.priority,
    current_content: input.currentContent || null,
    seo_issue: input.seoIssue,
    recommended_content: input.recommendedContent,
    seo_reason: input.seoReason,
    expected_benefit: input.expectedBenefit || null,
    status: input.status,
    created_by: null,
    created_at: now(),
    updated_at: now(),
  };
  store.recommendations.push(recommendation);
  return recommendation;
}

export function editRecommendation(recommendationId: string, input: RecommendationFields): Recommendation {
  const recommendation = store.recommendations.find((r) => r.id === recommendationId);
  if (!recommendation) throw new Error("Recommendation not found.");
  recommendation.section_name = input.sectionName;
  recommendation.category = input.category;
  recommendation.priority = input.priority;
  recommendation.current_content = input.currentContent || null;
  recommendation.seo_issue = input.seoIssue;
  recommendation.recommended_content = input.recommendedContent;
  recommendation.seo_reason = input.seoReason;
  recommendation.expected_benefit = input.expectedBenefit || null;
  recommendation.status = input.status;
  recommendation.updated_at = now();
  return recommendation;
}

export function setRecommendationStatus(recommendationId: string, status: RecommendationStatus) {
  const recommendation = store.recommendations.find((r) => r.id === recommendationId);
  if (!recommendation) throw new Error("Recommendation not found.");
  recommendation.status = status;
  recommendation.updated_at = now();
}

export function removeRecommendation(recommendationId: string) {
  store.recommendations = store.recommendations.filter((r) => r.id !== recommendationId);
  store.annotations = store.annotations.filter((a) => a.recommendation_id !== recommendationId);
  store.comments = store.comments.filter((c) => c.recommendation_id !== recommendationId);
}

export function insertAnnotation(input: {
  recommendationId: string;
  pageId: string;
  x: number;
  y: number;
  sectionName: string;
}): Annotation {
  const annotation: Annotation = {
    id: id(),
    recommendation_id: input.recommendationId,
    page_id: input.pageId,
    x_position: input.x,
    y_position: input.y,
    section_name: input.sectionName,
    created_at: now(),
  };
  store.annotations.push(annotation);
  return annotation;
}

export function moveAnnotation(annotationId: string, x: number, y: number) {
  const annotation = store.annotations.find((a) => a.id === annotationId);
  if (annotation) {
    annotation.x_position = x;
    annotation.y_position = y;
  }
}

export function removeAnnotation(annotationId: string) {
  store.annotations = store.annotations.filter((a) => a.id !== annotationId);
}

export function insertComment(recommendationId: string, userName: string, comment: string, authorType: CommentAuthorType): Comment {
  const row: Comment = {
    id: id(),
    recommendation_id: recommendationId,
    user_name: userName,
    author_type: authorType,
    comment,
    created_at: now(),
  };
  store.comments.push(row);
  return row;
}

export function findRecommendationProjectId(recommendationId: string): string | null {
  const recommendation = store.recommendations.find((r) => r.id === recommendationId);
  if (!recommendation) return null;
  const page = store.pages.find((p) => p.id === recommendation.page_id);
  return page?.project_id ?? null;
}
