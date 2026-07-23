export type RecPriority = "critical" | "high" | "medium" | "low";

export type RecCategory =
  | "content_optimization"
  | "keyword_optimization"
  | "search_intent"
  | "eeat"
  | "internal_linking"
  | "ux_improvement"
  | "conversion_optimization";

export type RecStatus =
  | "draft"
  | "sent_to_client"
  | "approved"
  | "rejected"
  | "implemented";

export type CommentAuthorType = "agency" | "client";

export type ProjectStatus = "active" | "completed" | "archived";

// NOTE: these row types are declared with `type` (not `interface`) on purpose.
// Supabase's generated client resolves table Row/Insert/Update types through a
// recursive conditional check against `Record<string, unknown>`; interfaces
// don't satisfy that check the same way object type aliases do, and silently
// collapse every query result to `never`.

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  client_name: string;
  website_url: string;
  project_name: string;
  target_keywords: string[];
  status: ProjectStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Page = {
  id: string;
  project_id: string;
  page_name: string;
  page_url: string;
  screenshot_url: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Recommendation = {
  id: string;
  page_id: string;
  section_name: string;
  category: RecCategory;
  priority: RecPriority;
  current_content: string | null;
  recommended_content: string;
  seo_reason: string;
  status: RecStatus;
  internal_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Annotation = {
  id: string;
  recommendation_id: string;
  page_id: string;
  x_position: number;
  y_position: number;
  label: string | null;
  created_at: string;
};

export type Comment = {
  id: string;
  recommendation_id: string;
  author_name: string;
  author_type: CommentAuthorType;
  comment: string;
  created_at: string;
};

export type ClientShare = {
  id: string;
  project_id: string;
  token: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: Partial<Project> & Pick<Project, "client_name" | "website_url" | "project_name">;
        Update: Partial<Project>;
        Relationships: [];
      };
      pages: {
        Row: Page;
        Insert: Partial<Page> & Pick<Page, "project_id" | "page_name" | "page_url">;
        Update: Partial<Page>;
        Relationships: [];
      };
      recommendations: {
        Row: Recommendation;
        Insert: Partial<Recommendation> &
          Pick<Recommendation, "page_id" | "section_name" | "recommended_content" | "seo_reason">;
        Update: Partial<Recommendation>;
        Relationships: [];
      };
      annotations: {
        Row: Annotation;
        Insert: Partial<Annotation> &
          Pick<Annotation, "recommendation_id" | "page_id" | "x_position" | "y_position">;
        Update: Partial<Annotation>;
        Relationships: [];
      };
      comments: {
        Row: Comment;
        Insert: Partial<Comment> & Pick<Comment, "recommendation_id" | "author_name" | "comment">;
        Update: Partial<Comment>;
        Relationships: [];
      };
      client_shares: {
        Row: ClientShare;
        Insert: Partial<ClientShare> & Pick<ClientShare, "project_id">;
        Update: Partial<ClientShare>;
        Relationships: [];
      };
    };
    Views: {
      project_stats: {
        Row: Project & {
          page_count: number;
          recommendation_count: number;
          approved_count: number;
        };
        Relationships: [];
      };
      page_stats: {
        Row: Page & {
          recommendation_count: number;
          approved_count: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
}

// --- View-model helper types -------------------------------------------------

export interface PageWithRecommendations extends Page {
  recommendations: Recommendation[];
}

export interface ProjectWithStats extends Project {
  page_count: number;
  recommendation_count: number;
  approved_count: number;
}

export interface RecommendationWithAnnotation extends Recommendation {
  annotation: Annotation | null;
  comments?: Comment[];
}

export const PRIORITY_LABELS: Record<RecPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const CATEGORY_LABELS: Record<RecCategory, string> = {
  content_optimization: "Content Optimization",
  keyword_optimization: "Keyword Optimization",
  search_intent: "Search Intent",
  eeat: "E-E-A-T",
  internal_linking: "Internal Linking",
  ux_improvement: "UX Improvement",
  conversion_optimization: "Conversion Optimization",
};

export const STATUS_LABELS: Record<RecStatus, string> = {
  draft: "Draft",
  sent_to_client: "Sent to Client",
  approved: "Approved",
  rejected: "Rejected",
  implemented: "Implemented",
};
