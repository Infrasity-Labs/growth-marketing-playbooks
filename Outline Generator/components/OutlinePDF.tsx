import { OutlineType } from "@/domain/outline";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
    backgroundColor: "#fff",
  },
  table: {
    border: "1px solid black",
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "ultrabold"
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "black",
    borderBottomStyle: "solid",
  },
  tableColHeader: {
    display: "flex",
    flexDirection: "column",
    width: "25%",
    padding: 10,
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "white",
    borderRight: "1px solid black",
  },
  tableCol: {
    width: "75%",
    padding: 10,
    fontSize: 12,
  },
  header: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  header2: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  listItem: {
    marginBottom: 7,
    fontSize: 12,
    listStyleType: "disc",
  },
  listItemLink: {
    marginBottom: 5,
    fontSize: 12,
    color: "blue",
  },
  keywordCell: {
    flex: 3,
    padding: 10,
    fontSize: 12,
  },
});

interface OutlinePDFProps {
  data: OutlineType;
}

const OutlinePDF: React.FC<OutlinePDFProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{data.Title || "No Title Provided"}</Text>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Brief</Text>
          <Text style={styles.tableCol}>
            {data.Brief || "No Brief Available"}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>URL</Text>
          <Text style={[styles.tableCol, {color: 'blue'}]}>{data.URL || "No URL Provided"}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Word Count</Text>
          <Text style={styles.tableCol}>
            {data["Word Count"] || "No Word Count"}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Target Intent</Text>
          <Text style={styles.tableCol}>
            {data["Target Intent"] || "No URL Provided"}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Target Audience</Text>
          <View style={styles.tableCol}>
            {data["Target Audience"].map((audience, index) => (
              <Text key={index} style={styles.listItem}>
                {audience}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Page Template</Text>
          <Text style={styles.tableCol}>{data["Page Template"]}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Focus Keyword</Text>
          <View style={styles.keywordCell}>
            {Object.entries(
              data["Keywords’ global search volume"]["Focus keyword"]
            ).map(([keyword, volume], index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Text style={[{ textAlign: "left" }]}>
                  {`${index + 1}. ${keyword}`}
                </Text>
                <Text style={[{ textAlign: "right" }]}>{volume}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Longtail KWs</Text>
          <View style={styles.keywordCell}>
            {Object.entries(
              data["Keywords’ global search volume"]["Longtail KWs"]
            ).map(([keyword, volume], index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Text style={[{ textAlign: "left" }]}>
                  {`${index + 1}. ${keyword}`}
                </Text>
                <Text style={[{ textAlign: "right" }]}>{volume}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.header}>Commonly Asked Questions</Text>
      {data["Commonly Asked Questions"] &&
        data["Commonly Asked Questions"].map((question, index) => (
          <Text key={index} style={styles.listItem}>
            {question}
          </Text>
        ))}

      <Text style={styles.header}>Suggested Outline</Text>
      <Text style={styles.header}>
        H1 Title: {data["Suggested Outline"].h1}
      </Text>
      {data["Suggested Outline"] &&
        data["Suggested Outline"].Sections &&
        data["Suggested Outline"].Sections.map((section, index) => (
          <View key={index}>
            <Text style={styles.header2}>
              H2 Title: {section.h2 || "Untitled Section"} ({section.paragraphs}{" "}paragraphs)
            </Text>
            {section.Content &&
              section.Content.map((paragraph, pIndex) => (
                <Text key={pIndex} style={styles.listItem}>
                  {paragraph}
                </Text>
              ))}
          </View>
        ))}
      <Text style={styles.header}>Highlighted Referenced Links</Text>
      {data["Highlighted Referenced Links"] &&
        data["Highlighted Referenced Links"].map((question, index) => (
          <View key={index}>
            <Text style={styles.listItemLink}>{question}</Text>
          </View>
        ))}
    </Page>
  </Document>
);

export default OutlinePDF;
