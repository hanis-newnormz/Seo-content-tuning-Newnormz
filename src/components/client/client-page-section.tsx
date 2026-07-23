import { ExternalLink } from "lucide-react";

import { ClientScreenshot } from "@/components/client/client-screenshot";
import { ClientRecommendationCard } from "@/components/client/client-recommendation-card";
import type { ClientReviewPage } from "@/lib/client-data";

export function ClientPageSection({
  token,
  data,
}: {
  token: string;
  data: ClientReviewPage;
}) {
  const orderedIds = data.recommendations.map((r) => r.id);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{data.page.page_name}</h2>
        <a
          href={data.page.page_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {data.page.page_url}
        </a>
      </div>

      <ClientScreenshot
        screenshotUrl={data.page.screenshot_url}
        annotations={data.annotations}
        recommendations={data.recommendations}
        orderedIds={orderedIds}
      />

      {data.recommendations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          No recommendations have been added for this page yet.
        </p>
      ) : (
        <div className="space-y-4">
          {data.recommendations.map((rec, i) => (
            <ClientRecommendationCard
              key={rec.id}
              token={token}
              recommendation={rec}
              number={i + 1}
              comments={data.commentsByRecommendation[rec.id] ?? []}
            />
          ))}
        </div>
      )}
    </section>
  );
}
