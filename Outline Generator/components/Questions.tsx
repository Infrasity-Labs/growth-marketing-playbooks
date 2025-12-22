import React, { useState, useEffect } from "react";
import { clearCookies, getIdTokenCookie, getRefreshTokenCookie, refineSections } from "@/http/api";
import { Document } from "@/domain/document";
import { OutlineType } from "@/domain/outline";
import { Oval } from "react-loader-spinner";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { firestore, signOutUser } from "@/lib/firebaseClient";
import internalUsers from "@/static-content/uid";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import BottomBar from "./BottomBar";
import TopBarTwo from "./TopBarTwo";
import { TagSelected } from "react-tag-autocomplete";
import LoaderWater from "./LoaderWater";
import router from "next/router";
import error from "next/error";

import { HistoryOutline } from "@/domain/historyOutline";
import IconCloseCircle from "@/public/icons/close-icon";
import IconHamburgerMenu from "@/public/icons/hamburger-icon";


interface Props {
  data: Document;
  topic: string;
  additionalInfo: string;
  client: string;
  difficulty: string;
  setFinalOutline: React.Dispatch<React.SetStateAction<OutlineType | null>>;
  onClose: () => void;
  targetAudience: TagSelected[];
  cancelTwo: () => void;
  setSelectedSections: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSections: string[]
}

const QuestionsModal: React.FC<Props> = ({
  data,
  topic,
  additionalInfo,
  client,
  difficulty,
  setFinalOutline,
  onClose,
  targetAudience,
  cancelTwo,
  setSelectedSections,
  selectedSections
}) => {
  // const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [user, setUser] = useState<User>();
  const [token, setIdToken] = useState<string | undefined>();
  // const [refreshToken, setRefreshToken] = useState();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIdToken(token as string);
    }
  }, []);

  const CircleSelectedIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Empty Circle Icon Component (Not selected state)
const CircleEmptyIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="transparent"/>
  </svg>
);

  const messages = [
    "Initiating outline generation process...",
    "Analyzing provided information...",
    "Generating initial outline structure...",
    "Creating headings and subheadings...",
    "Compiling relevant data points...",
    "Refining content points for depth and accuracy...",
    "Completing quality assurance checks...",
    "Conducting final review for coherence and flow...",
    "Preparation complete. Finalizing...",
  ];

  let messageIndex = 0;

  const convertObjectToJSONstring = (obj: Object) => {
    return JSON.stringify(obj);
  };

  const updateLoadingMessage = () => {
    setLoadingMessage(messages[messageIndex]);
    if (messageIndex === messages.length - 1) {
      return;
    }
    messageIndex = (messageIndex + 1) % messages.length;
  };

  const handleToggleSection = (index: number) => {
    const sectionTitle = data.Sections[index].h2;
    setSelectedSections((prevSelectedSections) => {
      const currentIndex = prevSelectedSections.indexOf(sectionTitle);
      if (currentIndex > -1) {
        return prevSelectedSections.filter((title) => title !== sectionTitle);
      } else {
        const user = localStorage.getItem("user");
        const userData = user ? JSON.parse(user) : null;
        const uid = userData?.uid;
        if (uid && internalUsers.includes(uid)) {
          return [...prevSelectedSections, sectionTitle].sort((a, b) => {
            const indexA = data.Sections.findIndex(
              (section) => section.h2 === a
            );
            const indexB = data.Sections.findIndex(
              (section) => section.h2 === b
            );
            return indexA - indexB;
          });
        } else {
          return [...prevSelectedSections, sectionTitle].sort((a, b) => {
            const indexA = data.Sections.findIndex(
              (section) => section.h2 === a
            );
            const indexB = data.Sections.findIndex(
              (section) => section.h2 === b
            );
            return indexA - indexB;
          });
        }
        // if (prevSelectedSections.length < 4) {
        //   return [...prevSelectedSections, sectionTitle].sort((a, b) => {
        //     const indexA = data.Sections.findIndex((section) => section.h2 === a);
        //     const indexB = data.Sections.findIndex((section) => section.h2 === b);
        //     return indexA - indexB;
        //   });
        // } else {
        //   alert("You can select up to 4 sections only.");
        //   return prevSelectedSections;
        // }
      }
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRefineSections = async () => {
    const intervalId = setInterval(() => {
      updateLoadingMessage();
    }, 5000);
    try {
      setLoading(true);
      updateLoadingMessage();

      let userWorkPosition = "";

      if (user) {
        const uid = user.uid;
        const userRef = doc(firestore, "users", uid);
        const centralRef = doc(firestore, "outlines", "previous");
        const docSnap = await getDoc(userRef);
        const userDb = docSnap.data();

        userWorkPosition = userDb?.work;

        if (userDb) {
          const credits = userDb.credits;
          if (credits <= 0) {
            toast.error("You have insufficient credits to generate an outline");
            setLoading(false);
            clearInterval(intervalId);
            return;
          }

          let refineTargetAudience = targetAudience.map(
            (audience) => audience.value
          );

          const response = await refineSections(
            selectedSections,
            topic,
            difficulty,
            client,
            additionalInfo,
            // Temprory for user persona integration
            userWorkPosition,
            [],
            refineTargetAudience,
            await token
          );

          await updateDoc(userRef, {
            credits: credits - 0.5,
          });

          const event = new CustomEvent<number>('creditsUpdated', { detail: credits - 0.5 });
          window.dispatchEvent(event);

          await updateDoc(userRef, {
            history: arrayUnion({
              topic,
              additionalInfo,
              client,
              difficulty,
              outline: response,
              date: new Date().toISOString(),
            }),
          });
          // await updateDoc(centralRef, {
          //   history: arrayUnion({
          //     topic,
          //     additionalInfo,
          //     client,
          //     difficulty,
          //     outline: response,
          //     date: new Date().toISOString(),
          //   }),
          // });
          setFinalOutline(response);
          setLoading(false);
          clearInterval(intervalId);
          // topic: string;
          // outline: OutlineType;
          // additionalInfo: string;
          // client: string;
          // date: string;
          // difficulty: string;
          const event2 = new CustomEvent<HistoryOutline>("outline-generated", {
            detail: {
              topic: topic,
              outline: response,
              additionalInfo: additionalInfo,
              client: client,
              date: Date.now().toString(),
              difficulty: difficulty
            },
          });
          window.dispatchEvent(event2);
        }
        setLoading(false);
        clearInterval(intervalId);
      }
    } catch (error) {
      clearInterval(intervalId);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Internal server error");
      }
      setLoading(false);
    }
  };


  const BackgroundSVG = () => (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 944 564"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full object-cover"
      preserveAspectRatio="xMidYMid slice"
      style={{
        animation: 'pulse-slow 4s ease-in-out infinite'
      }}
    >
      <g filter="url(#filter0_f_913_2290)">
        <path
          className="glow-animation"
          d="M472 369.154C624.983 369.154 749 330.255 749 282.272C749 234.289 624.983 195.39 472 195.39C319.017 195.39 195 234.289 195 282.272C195 330.255 319.017 369.154 472 369.154Z"
          fill="#232DE3"
        />

      </g>
      <defs>
        <filter id="filter0_f_913_2290" x="0.240005" y="0.630386" width="943.52" height="563.283" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="97.38" result="effect1_foregroundBlur_913_2290" />
        </filter>
      </defs>
    </svg>
  );

  return (
    <div className="absolute inset-0 h-full w-full bg-gray-500 bg-opacity-50 overflow-y-auto flex justify-center items-center z-50">
      {/* <ToastContainer
        position="top-center"
        style={{ width: "98%", padding: "0" }}
      /> */}

      <style dangerouslySetInnerHTML={{
        __html: `
    @keyframes pulse-slow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.9; }
    }

    @keyframes glow {
      0%, 100% { 
        filter: brightness(0.8) saturate(0.9);
        transform: scale(0.98);
      }
      50% { 
        filter: brightness(1.3) saturate(1.3);
        transform: scale(1.02);
      }
    }

    .glow-animation {
      animation: glow 6s ease-in-out infinite;
      transform-origin: center;
      transform-box: fill-box;
    }
  `
      }} />


      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-none">
          <BackgroundSVG />
        </div>
      </div>
      <div className="bg-black shadow-lg mx-auto h-full flex flex-col gap-4 items-center w-full">
        <TopBarTwo />
        <div className="flex items-center flex-col -mb-6 md:-mb-0 md:gap-2 md:mt-12">
          <h1 className=" text-xl md:text-3xl font-bold text-gray-200">
            Select a heading
          </h1>
          <h1 className="text-[16px] font-semibold text-gray-200 mb-4">
            This will be your outline section heading
          </h1>
        </div>
        <div className="flex flex-col gap-6 flex-1 overflow-x-hidden rounded-lg w-full items-center">
          {data.Sections.map((section, index) => {
            const isSelected = selectedSections.includes(section.h2);

            return (
              <div
                key={index}
                className={`relative flex items-center p-3 md:p-4 gap-2 border w-[95%] md:w-[70%] backdrop-blur-sm transition-all cursor-pointer rounded-xl
        ${isSelected
                    ? "bg-gray-700 border-[#3c4199ee]"
                    : "bg-white/5 border-white/20 hover:bg-gray-700"
                  }`}
                onClick={() => handleToggleSection(index)}
              >
                <div className="w-6 h-6 flex-shrink-0">
                  {isSelected ? (
                    <CircleSelectedIcon className="w-5 h-5 mt-1 ml-1 text-green-400" />

                  ) : (
                    <CircleEmptyIcon className="w-5 h-5 mt-1 ml-1 text-gray-400" />
                  )}
                </div>

                <span className="text-gray-200 text-base font-medium">
                  {typeof section.h2 === "object"
                    ? convertObjectToJSONstring(section.h2)
                    : section.h2}
                </span>
              </div>
            );
          })}

        </div>
        <div className="w-full z-10">
          <BottomBar
            isStepOne={true}
            nextStep={handleRefineSections}
            cancel={onClose}
            cancelTwo={cancelTwo}
          />
        </div>
        {loading && (
          <LoaderWater loadingMessage={loadingMessage} />
          // <div className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm w-full h-full z-[60]">
          //   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          //     <Oval
          //       visible={true}
          //       height="80"
          //       width="80"
          //       color="#6b5be5"
          //       secondaryColor="#8380eb"
          //       ariaLabel="oval-loading"
          //       wrapperStyle={{}}
          //       wrapperClass=""
          //     />
          //   </div>
          //   <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pt-32 z-[70] text-center">
          //     {loadingMessage}
          //   </p>
          // </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsModal;