import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { ClientPageSection } from "@/components/client/client-page-section";
import { ClientProgressSummary } from "@/components/client/client-progress-summary";
import { Badge } from "@/components/ui/badge";
import { getClientReviewData } from "@/lib/client-data";

export default async function ClientReviewPage({ params }: { params: { token: string } }) {
  const data = await getClientReviewData(params.token);
  if (!data) notFound();

  const { project, pages } = data;

  const allRecommendations = pages.flatMap((p) => p.recommendations);
  const totalRecommendations = allRecommendations.length;
  const approvedCount = allRecommendations.filter((r) => r.status === "approved").length;

  let hostname = project.website_url;
  try {
    hostname = new URL(project.website_url).hostname;
  } catch {
    // keep raw value
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            SEO Content Review
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {project.client_name}
            </p>
            <h1 className="text-xl font-semibold">{project.project_name}</h1>
            <p className="text-xs text-muted-foreground">{hostname}</p>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl space-y-10 py-8">
        <div className="space-y-4">
          <ClientProgressSummary total={totalRecommendations} approved={approvedCount} />
          {project.target_keywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Target keywords:</span>
              {project.target_keywords.map((k) => (
                <Badge key={k} variant="secondary" className="font-normal">
                  {k}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {pages.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
            No pages have been added to this review yet — check back soon.
          </p>
        ) : (
          <div className="space-y-14">
            {pages.map((pageData) => (
              <ClientPageSection key={pageData.page.id} token={params.token} data={pageData} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        This review is for approving content recommendations only — it does not modify your live
        website.
      </footer>
    </div>
  );
}
