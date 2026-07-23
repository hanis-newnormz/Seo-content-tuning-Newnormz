"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageOff, MousePointerClick } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Annotation, Recommendation } from "@/types/database";

const PRIORITY_DOT: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-warning",
  medium: "bg-primary",
  low: "bg-muted-foreground",
};

interface PinPosition {
  x: number;
  y: number;
}

export function ScreenshotCanvas({
  screenshotUrl,
  annotations,
  recommendations,
  orderedIds,
  selectedId,
  onSelect,
  onCreatePin,
  onMovePin,
}: {
  screenshotUrl: string | null;
  annotations: Annotation[];
  recommendations: Recommendation[];
  orderedIds: string[];
  selectedId: string | null;
  onSelect: (recommendationId: string) => void;
  onCreatePin: (position: PinPosition) => void;
  onMovePin: (annotationId: string, position: PinPosition) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    annotationId: string;
    moved: boolean;
    position: PinPosition;
  } | null>(null);

  const recommendationById = new Map(recommendations.map((r) => [r.id, r]));

  function positionFromEvent(clientX: number, clientY: number): PinPosition {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
  }

  function handleBackgroundClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!screenshotUrl) return;
    // Pins are direct children handled entirely via pointer down/up above;
    // the browser still synthesizes a bubbling `click` after those events,
    // so ignore it here or a pin tap would also drop a new pin underneath it.
    if (e.target !== e.currentTarget) return;
    onCreatePin(positionFromEvent(e.clientX, e.clientY));
  }

  function handlePinPointerDown(annotation: Annotation, e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragState({
      annotationId: annotation.id,
      moved: false,
      position: { x: annotation.x_position, y: annotation.y_position },
    });
  }

  function handlePinPointerMove(e: React.PointerEvent) {
    if (!dragState) return;
    const position = positionFromEvent(e.clientX, e.clientY);
    setDragState((prev) => (prev ? { ...prev, moved: true, position } : prev));
  }

  function handlePinPointerUp(annotation: Annotation, e: React.PointerEvent) {
    if (!dragState) return;
    e.stopPropagation();
    if (dragState.moved) {
      onMovePin(annotation.id, dragState.position);
    } else {
      onSelect(annotation.recommendation_id);
    }
    setDragState(null);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <MousePointerClick className="h-3.5 w-3.5" />
          Click anywhere on the screenshot to pin a recommendation
        </p>
      </div>
      <div
        ref={containerRef}
        onClick={handleBackgroundClick}
        className={cn(
          "relative w-full select-none bg-muted",
          screenshotUrl ? "cursor-crosshair" : "",
        )}
        style={{ minHeight: screenshotUrl ? undefined : "24rem" }}
      >
        {screenshotUrl ? (
          <Image
            src={screenshotUrl}
            alt="Page screenshot"
            width={1600}
            height={2000}
            className="pointer-events-none h-auto w-full"
            unoptimized
            priority
          />
        ) : (
          <div className="flex h-96 flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-8 w-8" />
            <p className="text-sm">Upload a screenshot to start annotating</p>
          </div>
        )}

        {annotations.map((annotation) => {
          const rec = recommendationById.get(annotation.recommendation_id);
          if (!rec) return null;
          const isDragging = dragState?.annotationId === annotation.id;
          const pos = isDragging ? dragState.position : { x: annotation.x_position, y: annotation.y_position };
          const number = orderedIds.indexOf(rec.id) + 1;
          const isSelected = selectedId === rec.id;

          return (
            <button
              key={annotation.id}
              type="button"
              onPointerDown={(e) => handlePinPointerDown(annotation, e)}
              onPointerMove={handlePinPointerMove}
              onPointerUp={(e) => handlePinPointerUp(annotation, e)}
              className={cn(
                "absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-lg ring-2 ring-black/10 transition-transform hover:scale-110",
                PRIORITY_DOT[rec.priority] ?? "bg-primary",
                isSelected && "scale-125 ring-4 ring-accent",
              )}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              title={rec.section_name}
            >
              {number}
            </button>
          );
        })}
      </div>
    </div>
  );
}
