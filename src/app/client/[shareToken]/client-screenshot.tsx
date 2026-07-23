"use client";

import { ImageOff } from "lucide-react";

import { PRIORITY_DOT_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { RecommendationPriority } from "@/lib/supabase/database.types";

interface Pin {
  id: string;
  recommendation_id: string;
  x_position: number;
  y_position: number;
  index: number;
  priority: RecommendationPriority;
}

export function ClientScreenshot({
  screenshotUrl,
  pageName,
  pins,
  activeRecommendationId,
}: {
  screenshotUrl: string | null;
  pageName: string;
  pins: Pin[];
  activeRecommendationId: string | null;
}) {
  if (!screenshotUrl) {
    return (
      <div className="flex aspect-video items-center justify-center gap-2 rounded-xl border border-border bg-secondary/40 text-muted-foreground">
        <ImageOff className="h-6 w-6" />
        <span className="text-sm">No screenshot uploaded</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-white shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={screenshotUrl} alt={pageName} className="block w-full" />
      {pins.map((pin) => (
        <a
          key={pin.id}
          href={`#recommendation-${pin.recommendation_id}`}
          style={{ left: `${pin.x_position}%`, top: `${pin.y_position}%` }}
          className={cn(
            "absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-md transition-transform hover:scale-110",
            PRIORITY_DOT_COLOR[pin.priority],
            activeRecommendationId === pin.recommendation_id && "scale-110 ring-2 ring-offset-2 ring-primary"
          )}
        >
          {pin.index + 1}
        </a>
      ))}
    </div>
  );
}
