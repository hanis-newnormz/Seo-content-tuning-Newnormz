"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Plus, UploadCloud } from "lucide-react";

import { createPage } from "@/app/(app)/projects/[projectId]/actions";
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
import { uploadScreenshot } from "@/lib/upload-screenshot";

export function AddPageDialog({ projectId, nextOrder }: { projectId: string; nextOrder: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    const pageName = String(formData.get("pageName") ?? "").trim();
    const pageUrl = String(formData.get("pageUrl") ?? "").trim();
    const file = fileInputRef.current?.files?.[0] ?? null;

    if (!pageName || !pageUrl) {
      setError("Page name and URL are required.");
      return;
    }

    startTransition(async () => {
      try {
        let screenshotUrl: string | null = null;
        if (file) {
          screenshotUrl = await uploadScreenshot(projectId, file);
        }
        await createPage({ projectId, pageName, pageUrl, screenshotUrl, displayOrder: nextOrder });
        setOpen(false);
        setPreview(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setPreview(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4" />
          Add Page
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add website page</DialogTitle>
          <DialogDescription>Upload a screenshot of the page you want to review.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pageName">Page name</Label>
            <Input id="pageName" name="pageName" placeholder="Homepage" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageUrl">Page URL</Label>
            <Input id="pageUrl" name="pageUrl" type="url" placeholder="https://example.com" required />
          </div>
          <div className="space-y-2">
            <Label>Screenshot</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/40 p-6 text-center transition-colors hover:border-primary/40 hover:bg-secondary/70"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Screenshot preview" className="max-h-40 rounded-md object-contain" />
              ) : (
                <>
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload a screenshot (PNG/JPG)</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              Add page
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
