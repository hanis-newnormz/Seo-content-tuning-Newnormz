"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { PriorityBadge, CategoryBadge } from "@/components/shared/badges";
import { BeforeAfter } from "@/components/shared/before-after";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AISuggestion } from "@/lib/ai/analyze-page";

export function AIReviewDialog({
  open,
  onOpenChange,
  suggestions,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: AISuggestion[];
  onConfirm: (selected: AISuggestion[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<boolean[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) setSelected(suggestions.map(() => true));
  }, [open, suggestions]);

  const selectedCount = selected.filter(Boolean).length;

  async function handleConfirm() {
    setIsSaving(true);
    try {
      await onConfirm(suggestions.filter((_, i) => selected[i]));
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-suggested recommendations
          </DialogTitle>
          <DialogDescription>
            Review each suggestion, uncheck anything that doesn&apos;t fit, then add the rest as
            recommendation cards. You can edit or pin any of them afterward.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {suggestions.map((s, i) => (
            <label
              key={i}
              className="flex cursor-pointer gap-3 rounded-lg border border-border bg-secondary/30 p-4"
            >
              <Checkbox
                checked={selected[i] ?? true}
                onCheckedChange={(checked) =>
                  setSelected((prev) => prev.map((v, idx) => (idx === i ? Boolean(checked) : v)))
                }
                className="mt-1"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{s.section_name}</p>
                  <PriorityBadge priority={s.priority} />
                  <CategoryBadge category={s.category} />
                </div>
                <p className="text-sm text-muted-foreground">{s.seo_issue}</p>
                <BeforeAfter current={s.current_content} recommended={s.recommended_content} />
                <p className="text-xs text-muted-foreground">{s.seo_reason}</p>
              </div>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSaving || selectedCount === 0}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Add {selectedCount} recommendation{selectedCount === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
