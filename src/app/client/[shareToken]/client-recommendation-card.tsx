"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, MessageSquare, Sparkles, XCircle } from "lucide-react";

import { clientAddComment, clientSetRecommendationStatus } from "@/app/client/[shareToken]/actions";
import { BeforeAfter } from "@/components/shared/before-after";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Comment, Recommendation } from "@/lib/supabase/database.types";

export function ClientRecommendationCard({
  shareToken,
  recommendation,
  index,
  comments,
}: {
  shareToken: string;
  recommendation: Recommendation;
  index: number;
  comments: Comment[];
}) {
  const [status, setStatus] = useState(recommendation.status);
  const [showComment, setShowComment] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [localComments, setLocalComments] = useState(comments);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function setRecommendationStatus(next: "Approved" | "Rejected") {
    setStatus(next);
    startTransition(async () => {
      try {
        await clientSetRecommendationStatus(shareToken, recommendation.id, next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setError("Please add your name and a comment.");
      return;
    }
    setError(null);
    const optimistic: Comment = {
      id: `temp-${Date.now()}`,
      recommendation_id: recommendation.id,
      user_name: name,
      author_type: "client",
      comment,
      created_at: new Date().toISOString(),
    };
    setLocalComments((prev) => [...prev, optimistic]);
    setComment("");
    startTransition(async () => {
      try {
        await clientAddComment(shareToken, recommendation.id, name, optimistic.comment);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <Card id={`recommendation-${recommendation.id}`} className="scroll-mt-6">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {index + 1}
        </span>
        <div>
          <p className="font-semibold">{recommendation.section_name}</p>
          <p className="text-xs text-muted-foreground">{recommendation.category}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Issue identified
          </p>
          <p className="text-sm">{recommendation.seo_issue}</p>
        </div>

        <BeforeAfter current={recommendation.current_content} recommended={recommendation.recommended_content} />

        <div className="rounded-lg border border-primary/20 bg-accent/60 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Expected benefit
          </p>
          <p className="text-sm text-accent-foreground/90">
            {recommendation.expected_benefit || recommendation.seo_reason}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button
            size="sm"
            variant={status === "Approved" ? "default" : "outline"}
            className={cn(status === "Approved" && "bg-success text-success-foreground hover:bg-success/90")}
            disabled={isPending}
            onClick={() => setRecommendationStatus("Approved")}
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant={status === "Rejected" ? "destructive" : "outline"}
            disabled={isPending}
            onClick={() => setRecommendationStatus("Rejected")}
          >
            <XCircle className="h-4 w-4" />
            Request changes
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowComment((v) => !v)}>
            <MessageSquare className="h-4 w-4" />
            Comment
          </Button>
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {localComments.length > 0 && (
          <div className="space-y-2 border-t border-border pt-3">
            {localComments.map((c) => (
              <div key={c.id} className="rounded-md bg-secondary/50 p-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{c.user_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.author_type === "agency" ? "Agency" : "Client"}
                  </span>
                </div>
                <p className="text-muted-foreground">{c.comment}</p>
              </div>
            ))}
          </div>
        )}

        {showComment && (
          <form onSubmit={submitComment} className="space-y-2 border-t border-border pt-3">
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea
              placeholder="Add a comment or question about this recommendation…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
            <Button type="submit" size="sm" disabled={isPending}>
              Post comment
            </Button>
          </form>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
