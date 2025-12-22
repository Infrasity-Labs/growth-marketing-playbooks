import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import OutlinePDF from "./OutlinePDF";
import { OutlineType } from "@/domain/outline";

interface OutlinePDFProps {
  data: OutlineType;
}

const ExportPDFButton: React.FC<OutlinePDFProps> = ({ data }) => (

  <PDFDownloadLink
    document={<OutlinePDF data={data} />}
    fileName={data.Title + ".pdf"}
    className=" bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl px-5 py-2.5 text-white text-sm sm:text-base w-[8rem] sm:w-[10rem] hover:bg-primary-dark transition-all text-center cursor-pointer"
  >
    {({ blob, url, loading, error }) =>
      loading ? "Loading..." : "Export as PDF"
    }
  </PDFDownloadLink>
);

export default ExportPDFButton;
