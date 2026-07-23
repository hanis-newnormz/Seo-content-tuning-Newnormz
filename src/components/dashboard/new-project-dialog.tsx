"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";

import { createProject, type ProjectActionState } from "@/lib/actions/projects";
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

const initialState: ProjectActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      Create project
    </Button>
  );
}

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createProject, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="h-4 w-4" />
          New review project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Create an SEO review project</DialogTitle>
            <DialogDescription>
              Set up a new client and website to start reviewing content recommendations.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Client name</Label>
              <Input
                id="client_name"
                name="client_name"
                placeholder="ABC International School"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                name="website_url"
                type="url"
                placeholder="https://example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_name">Project name</Label>
              <Input
                id="project_name"
                name="project_name"
                placeholder="Homepage Content Optimization"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_keywords">Target keywords</Label>
              <Textarea
                id="target_keywords"
                name="target_keywords"
                placeholder={"international school Malaysia\nbest international school Kuala Lumpur"}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">One keyword per line.</p>
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
