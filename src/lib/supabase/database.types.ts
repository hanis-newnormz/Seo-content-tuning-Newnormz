export type RecommendationPriority = "Critical" | "High" | "Medium" | "Low";

export type RecommendationCategory =
  | "Content Optimization"
  | "Keyword Optimization"
  | "Search Intent"
  | "EEAT"
  | "Internal Linking"
  | "UX Improvement"
  | "Conversion Optimization";

export type RecommendationStatus = "Draft" | "Sent to Client" | "Approved" | "Rejected" | "Implemented";

export type CommentAuthorType = "agency" | "client";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          client_name: string;
          website_url: string;
          project_name: string;
          target_keywords: string[];
          share_token: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> & {
          client_name: string;
          website_url: string;
          project_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          project_id: string;
          page_name: string;
          page_url: string;
          screenshot_url: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["pages"]["Row"]> & {
          project_id: string;
          page_name: string;
          page_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["pages"]["Row"]>;
        Relationships: [];
      };
      recommendations: {
        Row: {
          id: string;
          page_id: string;
          section_name: string;
          category: RecommendationCategory;
          priority: RecommendationPriority;
          current_content: string | null;
          seo_issue: string;
          recommended_content: string;
          seo_reason: string;
          expected_benefit: string | null;
          status: RecommendationStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["recommendations"]["Row"]> & {
          page_id: string;
          section_name: string;
          seo_issue: string;
          recommended_content: string;
          seo_reason: string;
        };
        Update: Partial<Database["public"]["Tables"]["recommendations"]["Row"]>;
        Relationships: [];
      };
      annotations: {
        Row: {
          id: string;
          recommendation_id: string;
          page_id: string;
          x_position: number;
          y_position: number;
          section_name: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["annotations"]["Row"]> & {
          recommendation_id: string;
          page_id: string;
          x_position: number;
          y_position: number;
        };
        Update: Partial<Database["public"]["Tables"]["annotations"]["Row"]>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          recommendation_id: string;
          user_name: string;
          author_type: CommentAuthorType;
          comment: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["comments"]["Row"]> & {
          recommendation_id: string;
          user_name: string;
          comment: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Page = Database["public"]["Tables"]["pages"]["Row"];
export type Recommendation = Database["public"]["Tables"]["recommendations"]["Row"];
export type Annotation = Database["public"]["Tables"]["annotations"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
