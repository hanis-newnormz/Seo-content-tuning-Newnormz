import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

import type { Page as PageRow, Project, Recommendation } from "@/lib/supabase/database.types";

const COLORS = {
  primary: "#4f46e5",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  card: "#f8fafc",
  success: "#15803d",
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: COLORS.text, fontFamily: "Helvetica" },
  coverPage: {
    padding: 56,
    backgroundColor: COLORS.primary,
    color: "#ffffff",
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  coverBrand: { fontSize: 12, fontWeight: 700, letterSpacing: 1 },
  coverTitle: { fontSize: 30, fontWeight: 700, marginTop: 140, lineHeight: 1.3 },
  coverMeta: { fontSize: 12, marginTop: 16, color: "#e0e7ff" },
  coverFooter: { fontSize: 9, color: "#c7d2fe" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 8,
    marginBottom: 16,
  },
  headerBrand: { fontSize: 9, fontWeight: 700, color: COLORS.primary },
  headerMeta: { fontSize: 8, color: COLORS.muted },
  pageSectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 10 },
  screenshot: { width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 4, marginBottom: 12 },
  card: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: 14,
    marginBottom: 14,
    backgroundColor: COLORS.card,
  },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  cardTitle: { fontSize: 12, fontWeight: 700 },
  badgeRow: { flexDirection: "row", gap: 6 },
  badge: {
    fontSize: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "#eef2ff",
    color: COLORS.primary,
  },
  label: { fontSize: 8, fontWeight: 700, color: COLORS.muted, marginBottom: 2, textTransform: "uppercase" },
  body: { fontSize: 10, marginBottom: 8, lineHeight: 1.4 },
  compareRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  compareCol: { flex: 1, padding: 8, borderRadius: 4 },
  currentCol: { backgroundColor: "#f1f5f9" },
  recommendedCol: { backgroundColor: "#ecfdf5" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 8, color: COLORS.muted, textAlign: "center" },
  screenshotPlaceholder: {
    width: "100%",
    height: 140,
    marginBottom: 12,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
    border: `1px dashed ${COLORS.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  screenshotPlaceholderText: { fontSize: 9, color: COLORS.muted },
});

// react-pdf's <Image> only supports raster formats (PNG/JPEG/WebP) — the demo
// data store seeds SVG data URIs, which render as a placeholder box instead.
function isRasterImageSrc(src: string) {
  return /^data:image\/(png|jpe?g|webp)/i.test(src) || (/^https?:\/\//i.test(src) && !/\.svg(\?|$)/i.test(src));
}

interface ReportPage extends PageRow {
  recommendations: Recommendation[];
}

export function ReportDocument({ project, pages }: { project: Project; pages: ReportPage[] }) {
  const totalRecommendations = pages.reduce((sum, p) => sum + p.recommendations.length, 0);
  const approved = pages.reduce(
    (sum, p) => sum + p.recommendations.filter((r) => r.status === "Approved").length,
    0
  );

  return (
    <Document title={`${project.project_name} — SEO Content Review`}>
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverBrand}>SEO CONTENT REVIEW BOARD</Text>
        <View>
          <Text style={styles.coverTitle}>{project.project_name}</Text>
          <Text style={styles.coverMeta}>Client: {project.client_name}</Text>
          <Text style={styles.coverMeta}>Website: {project.website_url}</Text>
          <Text style={styles.coverMeta}>
            {pages.length} pages reviewed · {totalRecommendations} recommendations · {approved} approved
          </Text>
          {project.target_keywords.length > 0 && (
            <Text style={styles.coverMeta}>Target keywords: {project.target_keywords.join(", ")}</Text>
          )}
        </View>
        <Text style={styles.coverFooter}>
          Generated {new Date().toISOString().slice(0, 10)} · Confidential — prepared for {project.client_name}
        </Text>
      </Page>

      {pages.map((page) => (
        <Page key={page.id} size="A4" style={styles.page} wrap>
          <View style={styles.header} fixed>
            <Text style={styles.headerBrand}>{project.project_name}</Text>
            <Text style={styles.headerMeta}>
              {page.page_name} · {page.page_url}
            </Text>
          </View>

          <Text style={styles.pageSectionTitle}>{page.page_name}</Text>
          {page.screenshot_url && isRasterImageSrc(page.screenshot_url) && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image style={styles.screenshot} src={page.screenshot_url} />
          )}
          {page.screenshot_url && !isRasterImageSrc(page.screenshot_url) && (
            <View style={styles.screenshotPlaceholder}>
              <Text style={styles.screenshotPlaceholderText}>Screenshot preview available in the web app</Text>
            </View>
          )}

          {page.recommendations.length === 0 ? (
            <Text style={styles.body}>No recommendations recorded for this page.</Text>
          ) : (
            page.recommendations.map((rec, i) => (
              <View key={rec.id} style={styles.card} wrap={false}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>
                    {i + 1}. {rec.section_name}
                  </Text>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badge}>{rec.priority}</Text>
                    <Text style={styles.badge}>{rec.category}</Text>
                    <Text style={styles.badge}>{rec.status}</Text>
                  </View>
                </View>

                <Text style={styles.label}>SEO Issue</Text>
                <Text style={styles.body}>{rec.seo_issue}</Text>

                <View style={styles.compareRow}>
                  <View style={[styles.compareCol, styles.currentCol]}>
                    <Text style={styles.label}>Current</Text>
                    <Text style={styles.body}>{rec.current_content || "—"}</Text>
                  </View>
                  <View style={[styles.compareCol, styles.recommendedCol]}>
                    <Text style={styles.label}>Recommended</Text>
                    <Text style={styles.body}>{rec.recommended_content}</Text>
                  </View>
                </View>

                <Text style={styles.label}>Why it matters</Text>
                <Text style={styles.body}>{rec.seo_reason}</Text>
                {rec.expected_benefit && (
                  <>
                    <Text style={styles.label}>Expected benefit</Text>
                    <Text style={styles.body}>{rec.expected_benefit}</Text>
                  </>
                )}
              </View>
            ))
          )}

          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            fixed
          />
        </Page>
      ))}
    </Document>
  );
}
