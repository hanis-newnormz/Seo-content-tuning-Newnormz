"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Annotation, Recommendation } from "@/types/database";

const PRIORITY_DOT: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-warning",
  medium: "bg-primary",
  low: "bg-muted-foreground",
};

export function ClientScreenshot({
  screenshotUrl,
  annotations,
  recommendations,
  orderedIds,
}: {
  screenshotUrl: string | null;
  annotations: Annotation[];
  recommendations: Recommendation[];
  orderedIds: string[];
}) {
  const recommendationById = new Map(recommendations.map((r) => [r.id, r]));

  if (!screenshotUrl) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted text-muted-foreground">
        <ImageOff className="h-8 w-8" />
        <p className="text-sm">Screenshot coming soon</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border shadow-card">
      <Image
        src={screenshotUrl}
        alt="Page screenshot"
        width={1600}
        height={2000}
        className="h-auto w-full"
        unoptimized
        priority
      />
      {annotations.map((annotation) => {
        const rec = recommendationById.get(annotation.recommendation_id);
        if (!rec) return null;
        const number = orderedIds.indexOf(rec.id) + 1;

        return (
          <a
            key={annotation.id}
            href={`#client-rec-${rec.id}`}
            className={cn(
              "absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-lg ring-2 ring-black/10 transition-transform hover:scale-110",
              PRIORITY_DOT[rec.priority] ?? "bg-primary",
            )}
            style={{ left: `${annotation.x_position}%`, top: `${annotation.y_position}%` }}
            title={rec.section_name}
          >
            {number}
          </a>
        );
      })}
    </div>
  );
}
