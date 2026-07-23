"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus } from "lucide-react";

import {
  createAnnotation,
  createRecommendation,
  deleteAnnotation,
  deleteRecommendation,
  updateAnnotationPosition,
  updateRecommendation,
  updateRecommendationStatus,
  type RecommendationInput,
} from "@/app/(app)/projects/[projectId]/pages/[pageId]/actions";
import { RecommendationCard } from "@/app/(app)/projects/[projectId]/pages/[pageId]/recommendation-card";
import { RecommendationFormDialog } from "@/app/(app)/projects/[projectId]/pages/[pageId]/recommendation-form-dialog";
import { ScreenshotCanvas } from "@/app/(app)/projects/[projectId]/pages/[pageId]/screenshot-canvas";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Annotation, Recommendation, RecommendationStatus } from "@/lib/supabase/database.types";

interface Props {
  pageId: string;
  pageName: string;
  screenshotUrl: string | null;
  initialRecommendations: Recommendation[];
  initialAnnotations: Annotation[];
}

export function ReviewWorkspace({
  pageId,
  pageName,
  screenshotUrl,
  initialRecommendations,
  initialAnnotations,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [annotations, setAnnotations] = useState(initialAnnotations);

  const [addPinMode, setAddPinMode] = useState(false);
  const [pinTargetRecommendationId, setPinTargetRecommendationId] = useState<string | null>(null);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState<Recommendation | null>(null);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null);

  const pins = useMemo(
    () =>
      annotations.map((a) => {
        const rec = recommendations.find((r) => r.id === a.recommendation_id);
        const index = recommendations.findIndex((r) => r.id === a.recommendation_id);
        return { ...a, index, priority: rec?.priority ?? "Medium" };
      }),
    [annotations, recommendations]
  );

  function handleError(err: unknown) {
    toast({ variant: "destructive", title: "Something went wrong", description: String(err) });
  }

  function handlePlacePin(x: number, y: number) {
    if (pinTargetRecommendationId) {
      const rec = recommendations.find((r) => r.id === pinTargetRecommendationId);
      const targetId = pinTargetRecommendationId;
      setPinTargetRecommendationId(null);
      createAnnotation({ recommendationId: targetId, pageId, x, y, sectionName: rec?.section_name ?? "" })
        .then((created) => setAnnotations((prev) => [...prev, created]))
        .catch(handleError);
      return;
    }
    if (addPinMode) {
      setPendingPosition({ x, y });
      setAddPinMode(false);
      setEditingRecommendation(null);
      setDialogOpen(true);
    }
  }

  async function handleCreate(input: RecommendationInput) {
    const created = await createRecommendation(pageId, input);
    setRecommendations((prev) => [...prev, created]);
    if (pendingPosition) {
      const annotation = await createAnnotation({
        recommendationId: created.id,
        pageId,
        x: pendingPosition.x,
        y: pendingPosition.y,
        sectionName: input.sectionName,
      });
      setAnnotations((prev) => [...prev, annotation]);
      setPendingPosition(null);
    }
    setSelectedRecommendationId(created.id);
    router.refresh();
  }

  async function handleUpdate(input: RecommendationInput) {
    if (!editingRecommendation) return;
    const updated = await updateRecommendation(editingRecommendation.id, input);
    setRecommendations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    router.refresh();
  }

  function handleDelete(recommendationId: string) {
    setRecommendations((prev) => prev.filter((r) => r.id !== recommendationId));
    setAnnotations((prev) => prev.filter((a) => a.recommendation_id !== recommendationId));
    deleteRecommendation(pageId, recommendationId).then(() => router.refresh()).catch(handleError);
  }

  function handleStatusChange(recommendationId: string, status: RecommendationStatus) {
    setRecommendations((prev) => prev.map((r) => (r.id === recommendationId ? { ...r, status } : r)));
    updateRecommendationStatus(recommendationId, status).catch(handleError);
  }

  function handleMovePin(annotationId: string, x: number, y: number) {
    setAnnotations((prev) => prev.map((a) => (a.id === annotationId ? { ...a, x_position: x, y_position: y } : a)));
    updateAnnotationPosition(annotationId, x, y).catch(handleError);
  }

  function handleDeletePin(annotationId: string) {
    setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));
    deleteAnnotation(annotationId).catch(handleError);
  }

  function handleSelectPin(recommendationId: string) {
    setSelectedRecommendationId(recommendationId);
    document
      .getElementById(`recommendation-${recommendationId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
        <div>
          <p className="text-sm font-medium">{pageName}</p>
          <p className="text-xs text-muted-foreground">Split-screen review workspace</p>
        </div>
        <Button
          variant={addPinMode ? "secondary" : "outline"}
          size="sm"
          onClick={() => {
            setPinTargetRecommendationId(null);
            setAddPinMode((v) => !v);
          }}
        >
          <MapPin className="h-4 w-4" />
          {addPinMode ? "Placing pin…" : "Add pin + recommendation"}
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
        <div className="overflow-hidden border-b border-border lg:border-b-0 lg:border-r">
          <ScreenshotCanvas
            screenshotUrl={screenshotUrl}
            pageName={pageName}
            pins={pins}
            placing={addPinMode || pinTargetRecommendationId !== null}
            onCancelPlacing={() => {
              setAddPinMode(false);
              setPinTargetRecommendationId(null);
            }}
            onPlacePin={handlePlacePin}
            onSelectPin={handleSelectPin}
            onMovePin={handleMovePin}
            onDeletePin={handleDeletePin}
            selectedRecommendationId={selectedRecommendationId}
          />
        </div>

        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <p className="text-sm font-semibold">Recommendations ({recommendations.length})</p>
            <Button
              size="sm"
              onClick={() => {
                setEditingRecommendation(null);
                setPendingPosition(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add recommendation
            </Button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {recommendations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <p className="text-sm">No recommendations yet.</p>
                <p className="text-xs">Click on the screenshot or use &quot;Add recommendation&quot; to get started.</p>
              </div>
            ) : (
              recommendations.map((rec, i) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  index={i}
                  hasAnnotation={annotations.some((a) => a.recommendation_id === rec.id)}
                  highlighted={selectedRecommendationId === rec.id}
                  onEdit={() => {
                    setEditingRecommendation(rec);
                    setPendingPosition(null);
                    setDialogOpen(true);
                  }}
                  onDelete={() => handleDelete(rec.id)}
                  onAddPin={() => {
                    setAddPinMode(false);
                    setPinTargetRecommendationId(rec.id);
                  }}
                  onStatusChange={(status) => handleStatusChange(rec.id, status)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <RecommendationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editingRecommendation}
        onSubmit={editingRecommendation ? handleUpdate : handleCreate}
        onCancel={() => setPendingPosition(null)}
      />
    </div>
  );
}
