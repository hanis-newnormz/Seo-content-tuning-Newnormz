"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createAnnotation } from "@/lib/actions/annotations";
import { createRecommendation, updateRecommendation } from "@/lib/actions/recommendations";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Recommendation,
  type RecCategory,
  type RecPriority,
  type RecStatus,
} from "@/types/database";

export interface PendingPin {
  x: number;
  y: number;
}

export function RecommendationDialog({
  open,
  onOpenChange,
  pageId,
  pendingPin,
  recommendation,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  pendingPin?: PendingPin | null;
  recommendation?: Recommendation | null;
  onSaved: () => void;
}) {
  const isEdit = Boolean(recommendation);

  const [sectionName, setSectionName] = useState("");
  const [category, setCategory] = useState<RecCategory>("content_optimization");
  const [priority, setPriority] = useState<RecPriority>("medium");
  const [status, setStatus] = useState<RecStatus>("draft");
  const [currentContent, setCurrentContent] = useState("");
  const [recommendedContent, setRecommendedContent] = useState("");
  const [seoReason, setSeoReason] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSectionName(recommendation?.section_name ?? "");
      setCategory(recommendation?.category ?? "content_optimization");
      setPriority(recommendation?.priority ?? "medium");
      setStatus(recommendation?.status ?? "draft");
      setCurrentContent(recommendation?.current_content ?? "");
      setRecommendedContent(recommendation?.recommended_content ?? "");
      setSeoReason(recommendation?.seo_reason ?? "");
      setInternalNotes(recommendation?.internal_notes ?? "");
    }
  }, [open, recommendation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sectionName.trim() || !recommendedContent.trim() || !seoReason.trim()) {
      toast.error("Section, recommendation, and reason are required.");
      return;
    }

    setSaving(true);
    try {
      const input = {
        section_name: sectionName.trim(),
        category,
        priority,
        status,
        current_content: currentContent.trim(),
        recommended_content: recommendedContent.trim(),
        seo_reason: seoReason.trim(),
        internal_notes: internalNotes.trim(),
      };

      if (isEdit && recommendation) {
        await updateRecommendation(recommendation.id, input);
        toast.success("Recommendation updated");
      } else {
        const created = await createRecommendation({ page_id: pageId, ...input });
        if (pendingPin) {
          await createAnnotation(pageId, created.id, pendingPin.x, pendingPin.y);
        }
        toast.success("Recommendation added");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit recommendation" : "New recommendation"}</DialogTitle>
            <DialogDescription>
              Describe the section, the SEO issue, and exactly what to change and why.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section_name">Section</Label>
              <Input
                id="section_name"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="Hero Heading"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as RecCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as RecPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as RecStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_content">Current content</Label>
              <Textarea
                id="current_content"
                value={currentContent}
                onChange={(e) => setCurrentContent(e.target.value)}
                placeholder={'"Welcome to ABC School"'}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommended_content">Recommended content</Label>
              <Textarea
                id="recommended_content"
                value={recommendedContent}
                onChange={(e) => setRecommendedContent(e.target.value)}
                placeholder={'"Leading International School in Kuala Lumpur Offering World-Class Education"'}
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo_reason">SEO issue &amp; reason</Label>
              <Textarea
                id="seo_reason"
                value={seoReason}
                onChange={(e) => setSeoReason(e.target.value)}
                placeholder="The heading does not clearly communicate the school's location or offering. This change improves search relevance and helps users immediately understand the service."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_notes">Internal notes (never shown to client)</Label>
              <Textarea
                id="internal_notes"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Optional — context for the team only"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {isEdit ? "Save changes" : "Add recommendation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
