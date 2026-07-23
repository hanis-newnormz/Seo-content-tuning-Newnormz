"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";

import { createProject } from "@/app/(app)/projects/actions";
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
import { Textarea } from "@/components/ui/textarea";

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createProject({ error: null }, formData);
      if (result?.error) setError(result.error);
      else setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New Review Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create SEO review project</DialogTitle>
          <DialogDescription>
            Set up a new client project to start reviewing website content.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client name</Label>
            <Input id="clientName" name="clientName" placeholder="ABC International School" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              name="websiteUrl"
              placeholder="https://example.com"
              type="url"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectName">Project name</Label>
            <Input id="projectName" name="projectName" placeholder="Homepage Content Optimization" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetKeywords">Target keywords</Label>
            <Textarea
              id="targetKeywords"
              name="targetKeywords"
              placeholder={"international school Malaysia\nbest international school Kuala Lumpur"}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">One keyword per line.</p>
          </div>

          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
