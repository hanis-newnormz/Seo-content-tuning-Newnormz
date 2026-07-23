import type { RecommendationCategory, RecommendationPriority, RecommendationStatus } from "@/lib/supabase/database.types";

export const PRIORITY_OPTIONS: RecommendationPriority[] = ["Critical", "High", "Medium", "Low"];

export const CATEGORY_OPTIONS: RecommendationCategory[] = [
  "Content Optimization",
  "Keyword Optimization",
  "Search Intent",
  "EEAT",
  "Internal Linking",
  "UX Improvement",
  "Conversion Optimization",
];

export const STATUS_OPTIONS: RecommendationStatus[] = [
  "Draft",
  "Sent to Client",
  "Approved",
  "Rejected",
  "Implemented",
];

export const PRIORITY_BADGE_VARIANT: Record<RecommendationPriority, "destructive" | "warning" | "default" | "secondary"> = {
  Critical: "destructive",
  High: "warning",
  Medium: "default",
  Low: "secondary",
};

export const STATUS_BADGE_VARIANT: Record<RecommendationStatus, "secondary" | "default" | "success" | "destructive" | "warning"> = {
  Draft: "secondary",
  "Sent to Client": "default",
  Approved: "success",
  Rejected: "destructive",
  Implemented: "warning",
};

export const PRIORITY_DOT_COLOR: Record<RecommendationPriority, string> = {
  Critical: "bg-destructive",
  High: "bg-warning",
  Medium: "bg-primary",
  Low: "bg-muted-foreground",
};
