"use client";

import { forwardRef } from "react";
import { MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { BeforeAfter } from "@/components/shared/before-after";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Recommendation, RecommendationStatus } from "@/lib/supabase/database.types";

interface Props {
  recommendation: Recommendation;
  index: number;
  hasAnnotation: boolean;
  highlighted: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddPin: () => void;
  onStatusChange: (status: RecommendationStatus) => void;
}

export const RecommendationCard = forwardRef<HTMLDivElement, Props>(function RecommendationCard(
  { recommendation: r, index, hasAnnotation, highlighted, onEdit, onDelete, onAddPin, onStatusChange },
  ref
) {
  return (
    <Card
      ref={ref}
      id={`recommendation-${r.id}`}
      className={cn(
        "scroll-mt-4 transition-shadow",
        highlighted && "ring-2 ring-primary shadow-popover"
      )}
    >
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {index + 1}
          </span>
          <div>
            <p className="font-semibold leading-tight">{r.section_name}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <PriorityBadge priority={r.priority} />
              <CategoryBadge category={r.category} />
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {!hasAnnotation && (
              <DropdownMenuItem onSelect={onAddPin}>
                <MapPin className="h-4 w-4" />
                Add pin on screenshot
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">SEO issue</p>
          <p className="text-sm text-foreground/90">{r.seo_issue}</p>
        </div>

        <BeforeAfter current={r.current_content} recommended={r.recommended_content} />

        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Why it matters
          </p>
          <p className="text-sm text-muted-foreground">{r.seo_reason}</p>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Select value={r.status} onValueChange={(v) => onStatusChange(v as RecommendationStatus)}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <StatusBadge status={r.status} />
        </div>
      </CardContent>
    </Card>
  );
});
