import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { DEMO_MODE } from "@/lib/demo/config";
import { getProjectForExport } from "@/lib/data";
import { ReportDocument } from "@/lib/pdf/report-document";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { projectId: string } }) {
  if (!DEMO_MODE) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await getProjectForExport(params.projectId);
  if (!result) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { project, pages } = result;

  const buffer = await renderToBuffer(ReportDocument({ project, pages }));

  const fileName = `${project.project_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-seo-review.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  });
}
