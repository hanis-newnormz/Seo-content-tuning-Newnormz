"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import type { Recommendation } from "@/lib/supabase/database.types";
import type { RecommendationInput } from "@/app/(app)/projects/[projectId]/pages/[pageId]/actions";

const EMPTY: RecommendationInput = {
  sectionName: "",
  category: "Content Optimization",
  priority: "Medium",
  currentContent: "",
  seoIssue: "",
  recommendedContent: "",
  seoReason: "",
  expectedBenefit: "",
  status: "Draft",
};

export function RecommendationFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Recommendation | null;
  onSubmit: (input: RecommendationInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<RecommendationInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setError(null);
      setForm(
        initial
          ? {
              sectionName: initial.section_name,
              category: initial.category,
              priority: initial.priority,
              currentContent: initial.current_content ?? "",
              seoIssue: initial.seo_issue,
              recommendedContent: initial.recommended_content,
              seoReason: initial.seo_reason,
              expectedBenefit: initial.expected_benefit ?? "",
              status: initial.status,
            }
          : EMPTY
      );
    }
  }, [open, initial]);

  function field<K extends keyof RecommendationInput>(key: K, value: RecommendationInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sectionName || !form.seoIssue || !form.recommendedContent || !form.seoReason) {
      setError("Section, SEO issue, recommendation, and reason are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit(form);
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel?.();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit recommendation" : "New recommendation"}</DialogTitle>
          <DialogDescription>
            Describe the issue, the change you recommend, and why it matters for SEO.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Section</Label>
              <Input
                value={form.sectionName}
                onChange={(e) => field("sectionName", e.target.value)}
                placeholder="Hero Heading"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => field("priority", v as typeof form.priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => field("category", v as typeof form.category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => field("status", v as typeof form.status)}>
                <SelectTrigger>
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
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current content</Label>
            <Textarea
              value={form.currentContent}
              onChange={(e) => field("currentContent", e.target.value)}
              placeholder={'"Welcome to ABC School"'}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>SEO issue</Label>
            <Textarea
              value={form.seoIssue}
              onChange={(e) => field("seoIssue", e.target.value)}
              placeholder="The heading does not clearly communicate the school's location or offering."
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Recommendation</Label>
            <Textarea
              value={form.recommendedContent}
              onChange={(e) => field("recommendedContent", e.target.value)}
              placeholder="Leading International School in Kuala Lumpur Offering World-Class Education"
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Reason it matters</Label>
            <Textarea
              value={form.seoReason}
              onChange={(e) => field("seoReason", e.target.value)}
              placeholder="Improves search relevance and helps users immediately understand the service."
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Expected benefit (shown to client)</Label>
            <Textarea
              value={form.expectedBenefit}
              onChange={(e) => field("expectedBenefit", e.target.value)}
              placeholder="Higher click-through from search results and clearer first impression."
              rows={2}
            />
          </div>

          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {initial ? "Save changes" : "Create recommendation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
