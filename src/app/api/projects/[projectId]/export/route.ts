import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { createClient } from "@/lib/supabase/server";
import { ReportDocument, formatGeneratedAt, type ReportPageData } from "@/lib/pdf/report-document";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { projectId: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.projectId)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("project_id", project.id)
    .order("position", { ascending: true });

  const pageList = pages ?? [];
  const pageIds = pageList.map((p) => p.id);

  const { data: allRecommendations } = pageIds.length
    ? await supabase
        .from("recommendations")
        .select("*")
        .in("page_id", pageIds)
        .order("created_at", { ascending: true })
    : { data: [] };

  const reportPages: ReportPageData[] = pageList.map((page) => ({
    page,
    recommendations: (allRecommendations ?? []).filter((r) => r.page_id === page.id),
  }));

  const body = await renderToBuffer(
    ReportDocument({
      project,
      pages: reportPages,
      generatedAt: formatGeneratedAt(new Date()),
    }),
  );

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${project.project_name.replace(/[^a-z0-9]+/gi, "-")}-seo-review.pdf"`,
    },
  });
}
