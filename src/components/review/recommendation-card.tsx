"use client";

import { useState } from "react";
import { ChevronDown, MessageSquare, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BeforeAfter } from "@/components/shared/before-after";
import { CommentThread } from "@/components/shared/comment-thread";
import { PriorityBadge, StatusBadge } from "@/components/review/priority-badge";
import { addAgencyComment, deleteRecommendation } from "@/lib/actions/recommendations";
import { CATEGORY_LABELS, type Comment, type Recommendation } from "@/types/database";
import { cn } from "@/lib/utils";

export function RecommendationCard({
  recommendation,
  number,
  comments,
  isSelected,
  onSelect,
  onEdit,
  onRefresh,
}: {
  recommendation: Recommendation;
  number: number;
  comments: Comment[];
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    try {
      await deleteRecommendation(recommendation.id, recommendation.page_id);
      toast.success("Recommendation deleted");
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

  return (
    <Card
      id={`rec-${recommendation.id}`}
      onClick={onSelect}
      className={cn(
        "cursor-pointer scroll-mt-24 transition-shadow",
        isSelected ? "ring-2 ring-accent" : "hover:shadow-elevated",
      )}
    >
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {number}
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {CATEGORY_LABELS[recommendation.category]}
            </p>
            <h4 className="font-semibold leading-tight">{recommendation.section_name}</h4>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <PriorityBadge priority={recommendation.priority} />
          <StatusBadge status={recommendation.status} />
        </div>

        <BeforeAfter
          current={recommendation.current_content}
          recommended={recommendation.recommended_content}
          reason={recommendation.seo_reason}
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowComments((s) => !s);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {comments.length} comment{comments.length === 1 ? "" : "s"}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showComments && "rotate-180")} />
        </button>

        {showComments && (
          <div onClick={(e) => e.stopPropagation()}>
            <CommentThread
              comments={comments}
              placeholder="Add an internal note or reply…"
              onSubmit={async ({ comment }) => {
                await addAgencyComment(recommendation.id, comment);
                onRefresh();
              }}
            />
          </div>
        )}
      </CardContent>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this recommendation?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the recommendation, its pin on the screenshot, and any comments. This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
