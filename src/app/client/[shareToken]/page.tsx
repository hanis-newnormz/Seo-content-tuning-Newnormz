import { notFound } from "next/navigation";
import { Globe2, Search } from "lucide-react";

import { ClientRecommendationCard } from "@/app/client/[shareToken]/client-recommendation-card";
import { ClientScreenshot } from "@/app/client/[shareToken]/client-screenshot";
import { Progress } from "@/components/ui/progress";
import { getProjectByShareToken } from "@/lib/data";
import type { Annotation, Comment, Page, Recommendation } from "@/lib/supabase/database.types";

// This page is fetched with the Supabase service-role client, which never calls
// a Next.js dynamic API (cookies/headers) — without this, Next can cache the
// first render indefinitely and never pick up status changes made afterward.
export const dynamic = "force-dynamic";

interface PageRow extends Page {
  recommendations: (Recommendation & { annotations: Annotation[]; comments: Comment[] })[];
}

export default async function ClientReviewPage({ params }: { params: { shareToken: string } }) {
  const data = await getProjectByShareToken(params.shareToken);
  if (!data) notFound();

  const { project, pages } = data;

  const typedPages = pages as unknown as PageRow[];

  const visiblePages = typedPages.map((page) => ({
    ...page,
    recommendations: page.recommendations.filter((r) => r.status !== "Draft"),
  }));

  const allRecommendations = visiblePages.flatMap((p) => p.recommendations);
  const approvedCount = allRecommendations.filter((r) => r.status === "Approved").length;
  const progress = allRecommendations.length ? Math.round((approvedCount / allRecommendations.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Search className="h-4 w-4" />
            SEO Content Review
          </div>
          <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{project.project_name}</h1>
              <p className="text-sm text-muted-foreground">Prepared for {project.client_name}</p>
              <a
                href={project.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
              >
                <Globe2 className="h-3.5 w-3.5" />
                {project.website_url}
              </a>
            </div>
            <div className="w-full max-w-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Review progress</span>
                <span className="text-muted-foreground">
                  {approvedCount}/{allRecommendations.length} approved
                </span>
              </div>
              <Progress value={progress} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-14 px-6 py-10">
        {visiblePages.length === 0 && (
          <p className="text-center text-muted-foreground">This review is not published yet.</p>
        )}
        {visiblePages.map((page) => {
          const pins = page.recommendations
            .flatMap((r) => r.annotations.map((a) => ({ ...a })))
            .map((a) => {
              const index = page.recommendations.findIndex((r) => r.id === a.recommendation_id);
              const rec = page.recommendations.find((r) => r.id === a.recommendation_id);
              return { ...a, index, priority: rec?.priority ?? "Medium" as const };
            });

          return (
            <section key={page.id} className="space-y-6">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">{page.page_name}</h2>
                <span className="text-sm text-muted-foreground">{page.page_url}</span>
              </div>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="lg:sticky lg:top-6 lg:self-start">
                  <ClientScreenshot
                    screenshotUrl={page.screenshot_url}
                    pageName={page.page_name}
                    pins={pins}
                    activeRecommendationId={null}
                  />
                </div>
                <div className="space-y-6">
                  {page.recommendations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recommendations published for this page yet.</p>
                  ) : (
                    page.recommendations.map((rec, i) => (
                      <ClientRecommendationCard
                        key={rec.id}
                        shareToken={params.shareToken}
                        recommendation={rec}
                        index={i}
                        comments={rec.comments}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
