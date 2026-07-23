"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

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

export function AIAnalyzeStartDialog({
  open,
  onOpenChange,
  isAnalyzing,
  onStart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAnalyzing: boolean;
  onStart: (competitorUrl: string) => void;
}) {
  const [competitorUrl, setCompetitorUrl] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Analyze with AI
          </DialogTitle>
          <DialogDescription>
            Claude will read the live page, research how top-ranking pages currently cover your target
            keywords, and draft recommendations for your team to review. This takes about 30-60 seconds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="competitorUrl">Direct competitor URL (optional)</Label>
          <Input
            id="competitorUrl"
            placeholder="https://competitor.com/similar-page"
            value={competitorUrl}
            onChange={(e) => setCompetitorUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            If you know a specific competitor page to benchmark against, add it here. Otherwise Claude
            will research top-ranking pages for your target keywords on its own.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={() => onStart(competitorUrl)} disabled={isAnalyzing}>
            {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isAnalyzing ? "Analyzing…" : "Run analysis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
