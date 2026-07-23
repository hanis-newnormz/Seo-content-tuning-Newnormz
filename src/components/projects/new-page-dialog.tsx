"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ImagePlus, Loader2, Plus } from "lucide-react";

import { createPage, type PageActionState } from "@/lib/actions/pages";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PageActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      Add page
    </Button>
  );
}

export function NewPageDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [state, formAction] = useFormState(createPage, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add page
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <input type="hidden" name="project_id" value={projectId} />
          <DialogHeader>
            <DialogTitle>Add a website page</DialogTitle>
            <DialogDescription>
              Upload a screenshot of the page so you can pin recommendations directly onto it.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="page_name">Page name</Label>
              <Input id="page_name" name="page_name" placeholder="Homepage" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="page_url">Page URL</Label>
              <Input
                id="page_url"
                name="page_url"
                type="url"
                placeholder="https://example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="screenshot">Screenshot</Label>
              <label
                htmlFor="screenshot"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 px-4 py-8 text-center transition-colors hover:bg-secondary"
              >
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {fileName ?? "Click to upload a full-page screenshot"}
                </span>
                <span className="text-xs text-muted-foreground">PNG or JPG, up to ~10MB</span>
                <input
                  id="screenshot"
                  name="screenshot"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                />
              </label>
            </div>
          </div>

          {state.error && (
            <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
