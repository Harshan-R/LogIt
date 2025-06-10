//..lib/pdfGenerator.ts

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";

// Types
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
};

// ShadCN-like styles
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
    marginBottom: 2,
  },
  text: {
    fontSize: 11,
    marginBottom: 4,
  },
  card: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e9ecef",
    padding: 6,
    fontWeight: "bold",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottom: "0.5 solid #dee2e6",
    backgroundColor: "#fff",
  },
  cell: {
    flex: 1,
    paddingRight: 5,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bar: {
    height: 8,
    backgroundColor: "#4f46e5",
    borderRadius: 4,
  },
  areaChartContainer: {
    backgroundColor: "#e0e7ff",
    height: 40,
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 10,
    flexDirection: "row",
  },
  areaSegment: {
    height: "100%",
    backgroundColor: "#6366f1",
    opacity: 0.8,
  },
  radialChart: {
    width: 80,
    height: 80,
    borderRadius: 40,
    border: "6 solid #6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    alignSelf: "center",
  },
});

// PDF Generator Function
export async function generatePDF({
  orgName,
  employee,
  timesheets,
  summaries,
  average_rating,
}: PDFOptions): Promise<Uint8Array> {
  const maxHours = Math.max(...timesheets.map((t) => t.hours_worked), 8);
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>{orgName}</Text>

        {/* Employee Details */}
        <View style={styles.section}>
          <Text style={styles.label}>Employee Details</Text>
          <Text style={styles.text}>ID: {employee.emp_id}</Text>
          <Text style={styles.text}>Name: {employee.name}</Text>
          <Text style={styles.text}>Designation: {employee.designation || "N/A"}</Text>
        </View>

        {/* Radial Chart for Average Rating */}
        {average_rating !== null && (
          <View style={styles.radialChart}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1d1d1f" }}>
              {average_rating.toFixed(1)}
            </Text>
          </View>
        )}

        {/* Ratings Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.label}>Ratings Overview</Text>
          {summaries.map((s, i) => (
            <View key={i} style={styles.barChart}>
              <Text style={{ width: 80 }}>{s.type}</Text>
              <View
                style={[
                  styles.bar,
                  { width: `${(s.rating / 10) * 100}%`, marginLeft: 6 },
                ]}
              />
              <Text style={{ marginLeft: 6 }}>{s.rating}/10</Text>
            </View>
          ))}
        </View>

        {/* Area Chart for Hours Worked */}
        <View style={styles.section}>
          <Text style={styles.label}>Hours Worked Overview</Text>
          <View style={styles.areaChartContainer}>
            {timesheets.map((t, i) => (
              <View
                key={i}
                style={[
                  styles.areaSegment,
                  { width: `${(1 / timesheets.length) * 100}%`, opacity: t.hours_worked / maxHours },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Timesheet Table */}
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
