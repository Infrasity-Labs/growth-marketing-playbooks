import { OutlineType } from "@/domain/outline";
import { clearCookies, exportOutlineToDocx, getIdTokenCookie, getRefreshTokenCookie } from "@/http/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { signOutUser } from "@/lib/firebaseClient";
import router from "next/router";
import error from "next/error";

interface ExportDOCXbtnProps {
  outline: OutlineType;
}

const ExportDOCXbtn: React.FC<ExportDOCXbtnProps> = ({ outline }) => {

  const [token, setIdToken] = useState<string | undefined>();

  // const token = getIdTokenCookie();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIdToken(token as string);
    }
  }, []);


  const exportToDocx = async () => {
    try {
      const blob = await exportOutlineToDocx(outline, await token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.docx";
      a.click();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div
      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl p-2 text-white text-sm sm:text-base w-[8rem] sm:w-[10rem] hover:bg-primary-dark transition-all text-center cursor-pointer"
      onClick={exportToDocx}
    >
      <ToastContainer
        position="top-center"
        style={{ width: "98%", padding: "0" }}
      />
      Export as DOCX
    </div>
  );
};

export default ExportDOCXbtn;
