// ..lib/pdfGenerator.ts

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  pdf,
} from "@react-pdf/renderer";

type PDFOptions = {
  orgName: string;
  employee: {
    emp_id: string;
    name: string;
    designation?: string;
  };
  timesheets: {
    date: string;
    hours_worked: number;
    work_summary: string;
    performance?: string;
    project?: { name?: string };
  }[];
  summaries: {
    type: string;
    summary: string;
    rating: number;
  }[];
  average_rating: number | null;

  // ✅ base64 chart images
  barChartImg: string; // base64 image string
  areaChartImg: string;
  radialChartImg: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#f8f9fa",
    color: "#212529",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1d1d1f",
  },
  section: {
    marginVertical: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  text: {
    fontSize: 11,
    marginBottom: 4,
  },
  card: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e9ecef",
    padding: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottom: "0.5 solid #dee2e6",
  },
  cell: {
    flex: 1,
    paddingRight: 5,
  },
  chartImage: {
    width: 450,
    height: 180,
    marginVertical: 10,
    alignSelf: "center",
  },
  radialChartImage: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginVertical: 12,
  },
});

export async function generatePDFWithCharts({
  orgName,
  employee,
  timesheets,
  summaries,
  average_rating,
  barChartImg,
  areaChartImg,
  radialChartImg,
}: PDFOptions): Promise<Uint8Array> {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{orgName}</Text>

        {/* Employee Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Employee Details</Text>
          <Text style={styles.text}>ID: {employee.emp_id}</Text>
          <Text style={styles.text}>Name: {employee.name}</Text>
          <Text style={styles.text}>
            Designation: {employee.designation || "N/A"}
          </Text>
        </View>

        {/* Radial Chart Image */}
        {radialChartImg && (
          <Image style={styles.radialChartImage} src={radialChartImg} />
        )}

        {/* Ratings Bar Chart */}
        {barChartImg && (
          <View style={styles.section}>
            <Text style={styles.label}>Ratings Overview</Text>
            <Image style={styles.chartImage} src={barChartImg} />
          </View>
        )}

        {/* Hours Area Chart */}
        {areaChartImg && (
          <View style={styles.section}>
            <Text style={styles.label}>Hours Worked Overview</Text>
            <Image style={styles.chartImage} src={areaChartImg} />
          </View>
        )}

        {/* Timesheet Entries */}
        <View style={styles.section}>
          <Text style={styles.label}>Timesheet Entries</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.cell}>Date</Text>
            <Text style={styles.cell}>Hours</Text>
            <Text style={styles.cell}>Project</Text>
            <Text style={styles.cell}>Performance</Text>
          </View>
          {timesheets.map((t, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.cell}>{t.date}</Text>
              <Text style={styles.cell}>{t.hours_worked}</Text>
              <Text style={styles.cell}>{t.project?.name || "-"}</Text>
              <Text style={styles.cell}>{t.performance || "-"}</Text>
            </View>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.label}>Summaries</Text>
          {summaries.map((s, i) => (
            <View key={i} style={styles.card}>
              <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                {s.type.toUpperCase()} (Rating: {s.rating}/10)
              </Text>
              <Text>{s.summary}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );

  return await pdf(doc).toBuffer();
}
