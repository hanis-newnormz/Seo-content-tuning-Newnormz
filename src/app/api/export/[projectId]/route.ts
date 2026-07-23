import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { ReportDocument } from "@/lib/pdf/report-document";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { projectId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.projectId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("*, recommendations(*)")
    .eq("project_id", project.id)
    .order("display_order", { ascending: true });

  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ReportDocument({ project, pages: (pages ?? []) as any })
  );

  const fileName = `${project.project_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-seo-review.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  });
}
