"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MessageCircleWarning, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { BeforeAfter } from "@/components/shared/before-after";
import { CommentThread } from "@/components/shared/comment-thread";
import { PriorityBadge } from "@/components/review/priority-badge";
import { submitClientComment, submitClientDecision } from "@/lib/actions/client-portal";
import { CATEGORY_LABELS, type Comment, type Recommendation } from "@/types/database";

const STATUS_COPY: Record<string, { label: string; className: string }> = {
  draft: { label: "Awaiting review", className: "bg-secondary text-secondary-foreground" },
  sent_to_client: { label: "Awaiting your review", className: "bg-secondary text-secondary-foreground" },
  approved: { label: "Approved", className: "bg-success text-success-foreground" },
  rejected: { label: "Changes requested", className: "bg-destructive text-destructive-foreground" },
  implemented: { label: "Implemented", className: "bg-primary text-primary-foreground" },
};

export function ClientRecommendationCard({
  token,
  recommendation,
  number,
  comments,
}: {
  token: string;
  recommendation: Recommendation;
  number: number;
  comments: Comment[];
}) {
  const router = useRouter();
  const [requestingChanges, setRequestingChanges] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const status = STATUS_COPY[recommendation.status] ?? STATUS_COPY.draft;

  async function handleApprove() {
    setSubmitting(true);
    try {
      await submitClientDecision(token, recommendation.id, "approved");
      toast.success("Marked as approved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitChangeRequest() {
    if (!changeNote.trim()) {
      toast.error("Let us know what you'd like changed.");
      return;
    }
    setSubmitting(true);
    try {
      if (name.trim()) {
        await submitClientComment(token, recommendation.id, name.trim(), changeNote.trim());
      }
      await submitClientDecision(token, recommendation.id, "rejected");
      toast.success("Change request sent");
      setRequestingChanges(false);
      setChangeNote("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card id={`client-rec-${recommendation.id}`} className="scroll-mt-24">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {number}
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {CATEGORY_LABELS[recommendation.category]}
            </p>
            <h3 className="text-lg font-semibold leading-tight">{recommendation.section_name}</h3>
          </div>
        </div>
        <Badge className={status.className}>{status.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          <PriorityBadge priority={recommendation.priority} />
        </div>

        <BeforeAfter
          current={recommendation.current_content}
          recommended={recommendation.recommended_content}
          reason={recommendation.seo_reason}
        />

        {requestingChanges ? (
          <div className="space-y-2 rounded-lg border border-border bg-secondary/40 p-3">
            <p className="text-sm font-medium">What would you like changed?</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-8 text-sm"
            />
            <Textarea
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="e.g. Please keep the school's tagline in the heading"
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitChangeRequest} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Send request
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRequestingChanges(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleApprove} disabled={submitting}>
              <ThumbsUp className="h-4 w-4" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRequestingChanges(true)}
              disabled={submitting}
            >
              <MessageCircleWarning className="h-4 w-4" /> Request changes
            </Button>
            {recommendation.status === "approved" && (
              <span className="flex items-center gap-1 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" /> You approved this
              </span>
            )}
          </div>
        )}

        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
            {comments.length > 0
              ? `${comments.length} comment${comments.length === 1 ? "" : "s"}`
              : "Add a comment"}
          </summary>
          <div className="mt-3">
            <CommentThread
              comments={comments}
              requireName
              placeholder="Add a comment for the team…"
              onSubmit={async ({ authorName, comment }) => {
                await submitClientComment(token, recommendation.id, authorName ?? "Client", comment);
                router.refresh();
              }}
            />
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
