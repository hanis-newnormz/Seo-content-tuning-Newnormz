"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, Share2 } from "lucide-react";

import { getOrCreateClientShare } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ShareLinkButton({
  projectId,
  existingToken,
  appUrl,
}: {
  projectId: string;
  existingToken?: string | null;
  appUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(existingToken ?? null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const link = token ? `${appUrl}/client/${token}` : "";

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && !token) {
      startTransition(async () => {
        const share = await getOrCreateClientShare(projectId);
        setToken(share.token);
      });
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="h-4 w-4" />
          Client review link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share with your client</DialogTitle>
          <DialogDescription>
            Anyone with this link can review recommendations and approve, request changes, or
            comment — no account required. Internal notes stay hidden.
          </DialogDescription>
        </DialogHeader>

        {isPending || !token ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Generating link…
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input readOnly value={link} className="font-mono text-xs" />
            <Button type="button" size="icon" variant="secondary" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
