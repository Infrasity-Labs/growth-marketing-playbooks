"use client";
import { useEffect, useRef, useState } from "react";
import OutlineGenerator from "@/app/outline-gen-2/hero";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import ExampleSection from "@/components/ExampleSection";
import { clearCookies, getRefreshTokenCookie } from "@/http/api";
import { toast } from "react-toastify";
import error from "next/error";
import { signOutUser } from "@/lib/firebaseClient";
// import router from "next/router";
import { useRouter } from "next/navigation";
import LoaderWater from "@/components/LoaderWater";

const Home = () => {

  const [refreshToken, setRefreshToken] = useState<string | undefined>();
  const exampleSectionRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      setLoading(false);
      setRefreshToken(refreshToken as string);
      console.log(refreshToken);
    } else {
      setLoading(false);
      signOutUser().then(() => {
        // localStorage.removeItem('token');
        // localStorage.removeItem('refresh_token');
        router.push("/auth/signup");
      });
    }
  }, [router]);

  const handleScrollToExampleSection = () => {
    if (exampleSectionRef.current) {
      exampleSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {loading ? <LoaderWater loadingMessage={"Loading please wait..."} /> : (
        !loading && refreshToken ?
          <div className="flex flex-col">
            <Topbar onScrollToExample={handleScrollToExampleSection} />
            {/* <Sidebar /> */}
            {/* <div className="flex-1 h-[90vh] overflow-y-auto bg-side-blue p-4 space-y-4">
          <OutlineGenerator />
          <div ref={exampleSectionRef}>
            <ExampleSection  />
          </div>
        </div> */}

            <OutlineGenerator />
          </div>
          : <LoaderWater loadingMessage={"Loading please wait..."} />
      )}
    </>
  );
};

export default Home;
