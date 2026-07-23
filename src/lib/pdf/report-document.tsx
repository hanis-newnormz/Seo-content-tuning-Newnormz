import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Page as ReviewPage,
  type Project,
  type Recommendation,
} from "@/types/database";
import { formatDate } from "@/lib/utils";

const COLORS = {
  primary: "#2b3583",
  accent: "#1b9e88",
  text: "#171b2e",
  muted: "#5a6478",
  border: "#dfe3ea",
  bg: "#f6f8fb",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 10,
    color: COLORS.text,
    fontFamily: "Helvetica",
  },
  coverPage: {
    padding: 56,
    backgroundColor: COLORS.primary,
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  coverBrand: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 700,
    marginTop: 16,
  },
  coverMeta: {
    marginTop: 24,
    fontSize: 12,
    lineHeight: 1.6,
  },
  coverFooter: {
    fontSize: 9,
    opacity: 0.75,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
    color: COLORS.primary,
  },
  pageUrl: {
    fontSize: 9,
    color: COLORS.muted,
    marginBottom: 12,
  },
  screenshot: {
    width: "100%",
    maxHeight: 260,
    objectFit: "cover",
    borderRadius: 4,
    marginBottom: 12,
    border: `1px solid ${COLORS.border}`,
  },
  card: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: 14,
    marginBottom: 14,
  },
  cardHeaderRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  badgeRow: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    color: "#ffffff",
    backgroundColor: COLORS.muted,
  },
  label: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: COLORS.muted,
    marginBottom: 2,
  },
  block: {
    marginBottom: 8,
  },
  currentText: {
    backgroundColor: COLORS.bg,
    padding: 8,
    borderRadius: 4,
    fontSize: 10,
  },
  recommendedText: {
    backgroundColor: "#e9f7f4",
    padding: 8,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
  },
  reasonText: {
    fontSize: 9.5,
    color: COLORS.muted,
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 8,
    color: COLORS.muted,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

const PRIORITY_COLOR: Record<string, string> = {
  critical: "#b91c1c",
  high: "#b45309",
  medium: COLORS.primary,
  low: COLORS.muted,
};

export interface ReportPageData {
  page: ReviewPage;
  recommendations: Recommendation[];
}

export function ReportDocument({
  project,
  pages,
  generatedAt,
}: {
  project: Project;
  pages: ReportPageData[];
  generatedAt: string;
}) {
  const totalRecommendations = pages.reduce((sum, p) => sum + p.recommendations.length, 0);
  const approvedCount = pages.reduce(
    (sum, p) => sum + p.recommendations.filter((r) => r.status === "approved").length,
    0,
  );

  return (
    <Document
      title={`${project.project_name} — SEO Content Review`}
      author="SEO Content Review Board"
    >
      <Page size="A4" style={styles.coverPage}>
        <View>
          <Text style={styles.coverBrand}>SEO Content Review Board</Text>
          <Text style={styles.coverTitle}>{project.project_name}</Text>
          <View style={styles.coverMeta}>
            <Text>Client: {project.client_name}</Text>
            <Text>Website: {project.website_url}</Text>
            <Text>
              Recommendations: {totalRecommendations} · Approved: {approvedCount}
            </Text>
            {project.target_keywords.length > 0 && (
              <Text>Target keywords: {project.target_keywords.join(", ")}</Text>
            )}
          </View>
        </View>
        <Text style={styles.coverFooter}>Generated {generatedAt}</Text>
      </Page>

      {pages.map((pageData) => (
        <Page key={pageData.page.id} size="A4" style={styles.page} wrap>
          <Text style={styles.sectionHeader}>{pageData.page.page_name}</Text>
          <Text style={styles.pageUrl}>{pageData.page.page_url}</Text>

          {pageData.page.screenshot_url && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={pageData.page.screenshot_url} style={styles.screenshot} />
          )}

          {pageData.recommendations.map((rec, i) => (
            <View key={rec.id} style={styles.card} wrap={false}>
              <View style={styles.cardHeaderRow}>
                <Text style={{ fontWeight: 700, fontSize: 11 }}>
                  {i + 1}. {rec.section_name}
                </Text>
                <View style={styles.badgeRow}>
                  <Text
                    style={[styles.badge, { backgroundColor: PRIORITY_COLOR[rec.priority] }]}
                  >
                    {PRIORITY_LABELS[rec.priority]}
                  </Text>
                  <Text style={styles.badge}>{CATEGORY_LABELS[rec.category]}</Text>
                  <Text style={[styles.badge, { backgroundColor: COLORS.accent }]}>
                    {STATUS_LABELS[rec.status]}
                  </Text>
                </View>
              </View>

              {rec.current_content && (
                <View style={styles.block}>
                  <Text style={styles.label}>Current content</Text>
                  <Text style={styles.currentText}>{rec.current_content}</Text>
                </View>
              )}

              <View style={styles.block}>
                <Text style={styles.label}>Recommended content</Text>
                <Text style={styles.recommendedText}>{rec.recommended_content}</Text>
              </View>

              <View>
                <Text style={styles.label}>SEO issue &amp; reason</Text>
                <Text style={styles.reasonText}>{rec.seo_reason}</Text>
              </View>
            </View>
          ))}

          <View style={styles.footer} fixed>
            <Text>{project.client_name} — SEO Content Review</Text>
            <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      ))}
    </Document>
  );
}

export function formatGeneratedAt(date: Date) {
  return formatDate(date);
}

// Re-export Link in case future report sections need clickable URLs.
export { Link };
