import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

import { EmentaModule } from "@/server/db/schema";

export interface EmentaPdfData {
  courseName: string;
  modality: string;
  workloadHours: number;
  brandName: string;
  modules: EmentaModule[];
}

const TEAL = "#1F8F86";
const INK = "#1F2937";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", color: INK },
  brand: { fontSize: 11, color: TEAL, letterSpacing: 2, textTransform: "uppercase", marginBottom: 18 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  meta: { fontSize: 11, color: "#555555", marginBottom: 24 },
  moduleBlock: { marginBottom: 16 },
  moduleTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: TEAL,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  topic: { fontSize: 11, marginBottom: 3, paddingLeft: 12 },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, fontSize: 9, color: "#9CA3AF", textAlign: "center" },
});

export function EmentaPdfDocument(data: EmentaPdfData) {
  return (
    <Document title={`Ementa — ${data.courseName}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>{data.brandName}</Text>
        <Text style={styles.title}>{data.courseName}</Text>
        <Text style={styles.meta}>
          {data.modality === "PRESENCIAL" ? "Curso presencial" : "Curso online"} · Carga horária: {data.workloadHours}h
        </Text>
        {data.modules.map((module, index) => (
          <View key={index} style={styles.moduleBlock}>
            <Text style={styles.moduleTitle}>
              Módulo {index + 1} — {module.title}
            </Text>
            {module.topics.map((topic, topicIndex) => (
              <Text key={topicIndex} style={styles.topic}>
                • {topic}
              </Text>
            ))}
          </View>
        ))}
        <Text style={styles.footer}>{data.brandName} — documento gerado automaticamente</Text>
      </Page>
    </Document>
  );
}

export async function renderEmentaPdf(data: EmentaPdfData): Promise<Buffer> {
  return renderToBuffer(<EmentaPdfDocument {...data} />);
}
