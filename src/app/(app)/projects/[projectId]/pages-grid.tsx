"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ImageOff, MoreVertical, Trash2 } from "lucide-react";

import { deletePage } from "@/app/(app)/projects/[projectId]/actions";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface PageItem {
  id: string;
  page_name: string;
  page_url: string;
  screenshot_url: string | null;
  recommendationCount: number;
  approvedCount: number;
}

export function PagesGrid({ projectId, pages }: { projectId: string; pages: PageItem[] }) {
  const [, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {pages.map((page) => {
        const progress = page.recommendationCount
          ? Math.round((page.approvedCount / page.recommendationCount) * 100)
          : 0;
        return (
          <Card key={page.id} className="group overflow-hidden">
            <Link href={`/projects/${projectId}/pages/${page.id}`}>
              <div className="relative aspect-video w-full overflow-hidden bg-secondary">
                {page.screenshot_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={page.screenshot_url}
                    alt={page.page_name}
                    className="h-full w-full object-cover object-top transition-transform group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}
              </div>
            </Link>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/projects/${projectId}/pages/${page.id}`} className="min-w-0">
                  <p className="truncate font-medium">{page.page_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{page.page_url}</p>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => startTransition(() => deletePage(projectId, page.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete page
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{page.recommendationCount} recommendations</span>
                  <span className="text-muted-foreground">
                    {page.approvedCount}/{page.recommendationCount} approved
                  </span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
