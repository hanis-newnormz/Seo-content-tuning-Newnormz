"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { initials, formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Comment } from "@/types/database";

export function CommentThread({
  comments,
  onSubmit,
  requireName = false,
  placeholder = "Add a comment…",
}: {
  comments: Comment[];
  onSubmit: (args: { authorName?: string; comment: string }) => Promise<void>;
  requireName?: boolean;
  placeholder?: string;
}) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || (requireName && !name.trim())) {
      toast.error("Please fill in the required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ authorName: name.trim() || undefined, comment: comment.trim() });
      setComment("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback
                  className={
                    c.author_type === "client"
                      ? "bg-accent text-[10px] text-accent-foreground"
                      : "bg-primary text-[10px] text-primary-foreground"
                  }
                >
                  {initials(c.author_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 rounded-lg bg-secondary/60 px-3 py-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold">{c.author_name}</p>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {c.author_type}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {formatDate(c.created_at)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-foreground">{c.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        {requireName && (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-8 text-sm"
          />
        )}
        <div className="flex gap-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={placeholder}
            rows={1}
            className="min-h-8 resize-none text-sm"
          />
          <Button type="submit" size="icon" variant="secondary" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
