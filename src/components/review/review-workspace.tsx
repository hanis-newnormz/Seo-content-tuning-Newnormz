"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScreenshotCanvas } from "@/components/review/screenshot-canvas";
import { RecommendationCard } from "@/components/review/recommendation-card";
import { RecommendationDialog, type PendingPin } from "@/components/review/recommendation-dialog";
import { updateAnnotationPosition } from "@/lib/actions/annotations";
import type { Annotation, Comment, Page, Recommendation } from "@/types/database";

export function ReviewWorkspace({
  page,
  recommendations,
  annotations,
  commentsByRecommendation,
}: {
  page: Page;
  recommendations: Recommendation[];
  annotations: Annotation[];
  commentsByRecommendation: Record<string, Comment[]>;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);

  const orderedIds = useMemo(() => recommendations.map((r) => r.id), [recommendations]);

  function refresh() {
    router.refresh();
  }

  function handleSelect(recommendationId: string) {
    setSelectedId(recommendationId);
    document
      .getElementById(`rec-${recommendationId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleCreatePin(position: PendingPin) {
    setPendingPin(position);
    setEditingRec(null);
    setDialogOpen(true);
  }

  function handleAddWithoutPin() {
    setPendingPin(null);
    setEditingRec(null);
    setDialogOpen(true);
  }

  function handleEdit(rec: Recommendation) {
    setEditingRec(rec);
    setPendingPin(null);
    setDialogOpen(true);
  }

  async function handleMovePin(annotationId: string, position: PendingPin) {
    try {
      await updateAnnotationPosition(annotationId, page.id, position.x, position.y);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not move pin");
    }
    refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ScreenshotCanvas
          screenshotUrl={page.screenshot_url}
          annotations={annotations}
          recommendations={recommendations}
          orderedIds={orderedIds}
          selectedId={selectedId}
          onSelect={handleSelect}
          onCreatePin={handleCreatePin}
          onMovePin={handleMovePin}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recommendations ({recommendations.length})
          </h2>
          <Button size="sm" variant="outline" onClick={handleAddWithoutPin}>
            <Plus className="h-4 w-4" /> Add recommendation
          </Button>
        </div>

        {recommendations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No recommendations yet. Click on the screenshot to pin your first one.
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                number={i + 1}
                comments={commentsByRecommendation[rec.id] ?? []}
                isSelected={selectedId === rec.id}
                onSelect={() => setSelectedId(rec.id)}
                onEdit={() => handleEdit(rec)}
                onRefresh={refresh}
              />
            ))}
          </div>
        )}
      </div>

      <RecommendationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pageId={page.id}
        pendingPin={pendingPin}
        recommendation={editingRec}
        onSaved={refresh}
      />
    </div>
  );
}
