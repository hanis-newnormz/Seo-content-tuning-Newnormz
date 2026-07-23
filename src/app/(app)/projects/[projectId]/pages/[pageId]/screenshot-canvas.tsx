"use client";

import { useRef, useState } from "react";
import { ImageOff, MousePointerClick, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PRIORITY_DOT_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Annotation, RecommendationPriority } from "@/lib/supabase/database.types";

export interface PinDatum extends Annotation {
  index: number;
  priority: RecommendationPriority;
}

interface Props {
  screenshotUrl: string | null;
  pageName: string;
  pins: PinDatum[];
  placing: boolean;
  onCancelPlacing: () => void;
  onPlacePin: (x: number, y: number) => void;
  onSelectPin: (recommendationId: string) => void;
  onMovePin: (annotationId: string, x: number, y: number) => void;
  onDeletePin: (annotationId: string) => void;
  selectedRecommendationId: string | null;
}

export function ScreenshotCanvas({
  screenshotUrl,
  pageName,
  pins,
  placing,
  onCancelPlacing,
  onPlacePin,
  onSelectPin,
  onMovePin,
  onDeletePin,
  selectedRecommendationId,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragMoved = useRef(false);

  function clampPercent(value: number) {
    return Math.min(100, Math.max(0, value));
  }

  function positionFromEvent(clientX: number, clientY: number) {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: clampPercent(((clientX - rect.left) / rect.width) * 100),
      y: clampPercent(((clientY - rect.top) / rect.height) * 100),
    };
  }

  function handleContainerClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!placing) return;
    if ((e.target as HTMLElement).closest("[data-pin]")) return;
    const { x, y } = positionFromEvent(e.clientX, e.clientY);
    onPlacePin(x, y);
  }

  function handlePinPointerDown(e: React.PointerEvent<HTMLButtonElement>, id: string) {
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingId(id);
    dragMoved.current = false;
  }

  function handlePinPointerMove(e: React.PointerEvent<HTMLButtonElement>, id: string) {
    if (draggingId !== id) return;
    dragMoved.current = true;
    const { x, y } = positionFromEvent(e.clientX, e.clientY);
    onMovePin(id, x, y);
  }

  function handlePinPointerUp(e: React.PointerEvent<HTMLButtonElement>, id: string, recommendationId: string) {
    if (draggingId !== id) return;
    setDraggingId(null);
    if (!dragMoved.current) {
      onSelectPin(recommendationId);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {placing && (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-accent px-4 py-2 text-sm text-accent-foreground">
          <span className="flex items-center gap-2">
            <MousePointerClick className="h-4 w-4" />
            Click anywhere on the screenshot to place a pin
          </span>
          <Button variant="ghost" size="sm" onClick={onCancelPlacing}>
            Cancel
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-auto bg-secondary/40 p-6">
        {screenshotUrl ? (
          <div
            ref={containerRef}
            onClick={handleContainerClick}
            className={cn(
              "relative mx-auto w-full max-w-3xl select-none overflow-hidden rounded-lg border border-border bg-white shadow-card",
              placing && "cursor-crosshair"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshotUrl} alt={pageName} className="block w-full" draggable={false} />
            {pins.map((pin) => {
              const selected = selectedRecommendationId === pin.recommendation_id;
              return (
                <button
                  key={pin.id}
                  data-pin
                  type="button"
                  onPointerDown={(e) => handlePinPointerDown(e, pin.id)}
                  onPointerMove={(e) => handlePinPointerMove(e, pin.id)}
                  onPointerUp={(e) => handlePinPointerUp(e, pin.id, pin.recommendation_id)}
                  style={{ left: `${pin.x_position}%`, top: `${pin.y_position}%` }}
                  className={cn(
                    "group absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-md transition-transform hover:scale-110 active:cursor-grabbing",
                    PRIORITY_DOT_COLOR[pin.priority],
                    selected && "z-10 scale-110 ring-2 ring-offset-2 ring-primary"
                  )}
                >
                  {pin.index + 1}
                  <span
                    role="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePin(pin.id);
                    }}
                    className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
                  >
                    <X className="h-2.5 w-2.5" />
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-8 w-8" />
            <p className="text-sm">No screenshot uploaded for this page yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
