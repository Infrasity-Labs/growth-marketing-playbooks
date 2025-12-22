"use client";
import { useState, useEffect, useCallback } from "react";
import Outline from "@/components/Outline";
import { Document } from "@/domain/document";
import { OutlineType } from "@/domain/outline";
import { clearCookies, getIdTokenCookie, getOutline, getRefreshTokenCookie } from "@/http/api";
import { Oval } from "react-loader-spinner";
import Questions from "@/components/Questions";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { firestore, signOutUser } from "@/lib/firebaseClient";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { ReactTags, Tag, TagSelected } from "react-tag-autocomplete";
import { targetAudiences } from "@/static-content/targetAudience";
import LoaderWater from "@/components/LoaderWater";
import useFeatureToggle from "@/hooks/useFeatureToggle";
import error from "next/error";
import { Typewriter } from "react-simple-typewriter";

import IconInformationCircleOutline from "@/public/icons/info-icon";
import { useRouter } from "next/navigation";
import { ChevronRight, Zap, Database, Code2, Sparkles, Star, X } from 'lucide-react';


function isValid(value: string) {
  return /^[a-z]{4,12}$/i.test(value);
}

const OutlineGenerator = () => {
  const [topic, setTopic] = useState<string>("");
  const [data, setData] = useState<Document>();
  const [model, setModel] = useState<string>("gpt-4-0125-preview");
  const [client, setClient] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [finalOutline, setFinalOutline] = useState<OutlineType | null>(null);
  const [user, setUser] = useState<User>();
  const [creditsEnd, setCreditsEnd] = useState<boolean>(false);

  const [selectedTargetAudience, setSelectedTargetAudience] = useState<
    TagSelected[]
  >([]);
  const [token, setIdToken] = useState<string | undefined>();
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const [hoverButton, setHoverButton] = useState<boolean>(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [selectedHeadings, setSelectedHeadings] = useState<string[]>([]);

  const [options, setOptions] = useState({
    activateFirstOption: false,
    allowBackspace: false,
    collapseOnSelect: false,
    isInvalid: false,
  });

  const isFeatureAEnabled = useFeatureToggle();

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIdToken(token as string);
    }
  }, []);



  useEffect(() => {
    const handleCreditsChecking = (event: CustomEvent<number>) => {
      setIsButtonDisabled(true);
      setCreditsEnd(true);
      console.log("Credits remaining:", event.detail);
    };

    window.addEventListener(
      "not-enough-credits",
      handleCreditsChecking as EventListener
    );

    return () => {
      window.removeEventListener(
        "not-enough-credits",
        handleCreditsChecking as EventListener
      );
    };
  }, []);

  // const token = getIdTokenCookie();

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

  const updateLoadingMessage = () => {
    setLoadingMessage(messages[messageIndex]);
    if (messageIndex === messages.length - 1) {
      return;
    }
    messageIndex = (messageIndex + 1) % messages.length;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, []);

  const onAdd = useCallback(
    (newTag: Tag) => {
      setSelectedTargetAudience([...selectedTargetAudience, newTag]);
    },
    [selectedTargetAudience]
  );

  useEffect(() => {
    console.log(selectedTargetAudience);
  }, [selectedTargetAudience]);

  const onDelete = useCallback(
    (tagIndex: number) => {
      setSelectedTargetAudience(
        selectedTargetAudience.filter((_, i) => i !== tagIndex)
      );
    },
    [selectedTargetAudience]
  );

  const onValidate = useCallback((value: string) => isValid(value), []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log(token);
    e.preventDefault();
    setLoading(true);
    updateLoadingMessage();
    const intervalId = setInterval(() => {
      updateLoadingMessage();
    }, 5000);
    try {
      let userWorkPosition = "";
      let userInterests = [];
      if (user) {
        // const userData = JSON.parse(user);
        const uid = user.uid;
        const userRef = doc(firestore, "users", uid);
        var docSnap = await getDoc(userRef);
        const userDb = docSnap.data();

        if (userDb) {
          // Temprory for user persona integration
          userWorkPosition = userDb.work;

          const credits = userDb.credits;
          if (credits <= 0) {
            toast.error("You have insufficient credits to generate an outline");
            setLoading(false);
            clearInterval(intervalId);
            return;
          }

          let targetAudience = selectedTargetAudience.map(
            (audience) => audience.value
          );

          const outline = await getOutline({
            topic,
            model,
            difficulty,
            client,
            additionalInfo,
            workPosition: userWorkPosition,
            interests: [],
            targetAudience,
            userId: user.uid, // <-- Add userId
            token            // <-- Add token
          });

          await updateDoc(userRef, {
            credits: credits - 0.5,
          });

          const event = new CustomEvent<number>("creditsUpdated", {
            detail: credits - 0.5,
          });
          window.dispatchEvent(event);

          clearInterval(intervalId);
          setLoading(false);
          setData(outline);
        }
      }
      clearInterval(intervalId);
      setLoading(false);
      // throw new Error("Error fetching outline, try again");
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

  const handleClose = () => {
    setFinalOutline(null);
    setData(undefined);
    setTopic("");
    setClient("");
    setAdditionalInfo("");
    setDifficulty("");
    setModel("gpt-4-0125-preview");
    setSelectedHeadings([]);
    setSelectedTargetAudience([])
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
          d="M472 369.154C624.983 369.154 749 330.255 749 282.272C749 234.289 624.983 195.39 472 195.39C319.017 195.39 195 234.289 195 282.272C195 330.255 319.017 369.154 472 369.154Z"
          fill="#232DE3"
          style={{
            animation: 'glow 6s ease-in-out infinite',
            transformOrigin: 'center'
          }}
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

  const tagInputClassNames = {
    root: "relative w-full bg-black/10 border border-white/20 rounded-xl px-3 sm:px-4 py-3 text-white", // OK
    rootIsActive: "",
    rootIsDisabled: "opacity-50 cursor-not-allowed",
    rootIsInvalid: "border-red-500",

    label: "hidden",
    tagList: "flex flex-wrap gap-2 mt-2",
    tagListItem: "inline-block",
    tag: "bg-[#5F64FF] text-white text-sm px-2 py-1 rounded-md flex items-center",
    tagName: "mr-1",
    comboBox: "flex flex-wrap gap-2",
    input: "bg-transparent text-white placeholder-gray-400 focus:outline-none w-full",

    listBox: `
    absolute left-0 top-full mt-2 z-50 
    w-full bg-black border border-white/20 
    rounded-md shadow-xl max-h-40 overflow-y-auto
  `,

    option: "px-4 py-2 hover:bg-[#3c4199ee] cursor-pointer text-white text-sm",
    optionIsActive: "bg-[#3c4199ee]",
    highlight: "text-purple-300 font-semibold",
  };



  return (
    <div className="bg-black text-white py-10 relative overflow-hidden">
      {creditsEnd && <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-black backdrop-blur-sm border border-white/20 transition-colors duration-500 ease-in-out rounded-2xl shadow-[#232DE3] shadow-1xl max-w-md w-full relative">
          {/* Close Button */}
          <button
            onClick={() => setCreditsEnd(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
              <Zap className="text-white" size={32} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Credits Expired
            </h2>

            <p className="text-gray-300 leading-relaxed">
              Your credits have ended. Please upgrade to continue generating more outlines with our AI tool.
            </p>
          </div>

          {/* Features */}
          <div className="px-6 pb-4">
            <div className="bg-black/20 border border-white/20 hover:border-[#3c4199ee] rounded-lg p-4 mb-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Sparkles className="text-[#818cf8] mr-2" size={18} />
                Upgrade Benefits
              </h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-4 h-4 bg-green-500 rounded-full">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Unlimited outline generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-4 h-4 bg-green-500 rounded-full">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Advanced AI features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-4 h-4 bg-green-500 rounded-full">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Priority support</span>
                </li>
              </ul>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 space-y-3">
            <a
              href="mailto:contact@infrasity.com"
              className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-800 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
            >
              Upgrade Now
            </a>


            <button
              onClick={() => setCreditsEnd(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
      }

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
                `
      }} />

      {/* Background SVG Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-none">
          <BackgroundSVG />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-screen-xl mx-auto">

        <div className="mb-8 inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 sm:px-6 py-3 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-[#818cf8]" />
          <span className="text-[#818cf8]">AI-Powered Outline Generator</span>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
            AI-Generated Outlines
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#9a89fa] to-[#e079d1] bg-clip-text text-transparent">
            for DevTool & AI Startups
          </h2>


          {/* Subtitle */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-gray-300 text-base sm:text-lg">
            <span>Generate high-impact outlines for your next blog, use case, or product tutorial. Ideal for</span>
            <span className="text-[#818cf8]">
              <Typewriter
                words={["AI infra", "LLM tools", "DevOps"]}
                cursor
                loop={1000}
                typeSpeed={100}
                deleteSpeed={100}
                delaySpeed={1000}
              />
            </span>
            <span>startups.</span>
          </div>
        </div>
        <form
          id="form"
          onSubmit={handleSubmit}
          className="w-full md:w-[55%]"
        >
          <div className="bg-black/20 backdrop-blur-sm border border-white/15 hover:border-[#3c4199ee] transition-colors duration-500 ease-in-out rounded-2xl p-6 lg:p-8 shadow-[#232DE3] shadow-1xl">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <Sparkles className="w-4 h-4 text-[#818cf8]" />
              <h3 className="text-lg sm:text-xl font-semibold">Generate Your Outline</h3>
            </div>

            <div className="space-y-6">
              <div className="mb-2">
                <label className="block text-sm sm:text-base text-gray-400 mb-2 font-medium">
                  Topic *
                </label>
                <input
                  disabled={isButtonDisabled}
                  required
                  id="topic"
                  type="text"
                  value={topic}
                  placeholder="E.g Authentication in React.js Application"
                  className="w-full bg-black/10 border border-white/20 rounded-xl px-3 sm:px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-[1px] focus:ring-[#3c4199ee] focus:border-transparent text-sm sm:text-base"
                  onChange={(e) => {
                    setTopic(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm sm:text-base text-gray-400 mb-2 font-medium">
                Additional Information
              </label>
              <input
                // rows={1}
                disabled={isButtonDisabled}
                id="client"
                className="w-full bg-black/10 border border-white/20 rounded-xl px-3 sm:px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-[1px] focus:ring-[#3c4199ee] focus:border-transparent text-sm sm:text-base"
                value={additionalInfo}
                placeholder="E.g Authentication should be implemented using JWT tokens"
                onChange={(e) => {
                  setAdditionalInfo(e.target.value);
                }}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm sm:text-base text-gray-400 mb-2 font-medium">
                Target Audience
              </label>
              <ReactTags
                allowNew
                // onValidate={onValidate}
                classNames={tagInputClassNames}
                renderTag={({ tag, classNames, ...props }) => (
                  <button
                    {...props}
                    className={`${classNames.tag} group`}
                  >
                    <span className={classNames.tagName}>{tag.label}</span>

                    <span
                      className="ml-2 text-white text-base leading-none group-hover:text-gray-400 cursor-pointer"
                    >
                      ×
                    </span>
                  </button>
                )}
                isDisabled={isButtonDisabled}
                id="country-selector"
                placeholderText={
                  selectedTargetAudience.length === 0
                    ? "E.g Web Developers, Coders, Software Developers"
                    : ""
                }
                labelText="Select countries"
                onAdd={onAdd}
                onDelete={onDelete}
                selected={selectedTargetAudience}
                suggestions={targetAudiences}
                {...options}
              />

            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm sm:text-base text-gray-400 mb-2 font-medium">
                  Client Name
                </label>
                <input
                  disabled={isButtonDisabled}
                  id="topic"
                  type="text"
                  value={client}
                  placeholder="E.g Google"
                  className="w-full bg-black/30 border border-white/20 rounded-xl px-3 sm:px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-[1px] focus:ring-[#3c4199ee] focus:border-transparent text-sm sm:text-base"
                  onChange={(e) => {
                    setClient(e.target.value);
                  }}
                />
              </div>
              <div className="relative">
                <label className="block text-sm sm:text-base text-gray-400 mb-2 font-medium">
                  Content Depth
                </label>
                <div
                  id="dropdownDefaultButton"
                  onClick={() => {
                    if (!isButtonDisabled) setShowDropDown(!showDropDown);
                  }}
                  className={`w-full bg-black/30 border border-white/20 hover:border-[#3c4199ee] rounded-xl px-3 sm:px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-[1px] focus:ring-[#3c4199ee] focus:border-transparent text-sm sm:text-base cursor-pointer flex items-center justify-between ${isButtonDisabled ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                >
                  {/* <div className=""> */}
                  {!difficulty ? (
                    <p className="truncate text-gray-400 cursor-default">
                      Select difficulty
                    </p>
                  ) : (
                    <p className="truncate">{difficulty}</p>
                  )}
                  {/* </div> */}
                  <svg
                    className="w-2.5 h-2.5 ms-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </div>

                <div
                  id="dropdown"
                  className={`z-10 ${showDropDown ? "block" : "hidden"
                    } absolute top-[105%] left-0 bg-black divide-y divide-gray-100 rounded-xl w-full shadow-xl border border-white/20`}
                >
                  <ul
                    className="py-2 text-sm text-white "
                    aria-labelledby="dropdownDefaultButton"
                  >
                    <li>
                      <div
                        className="block px-4 py-2 hover:bg-blue-600 hover:text-white w-full text-left cursor-pointer"
                        onClick={() => {
                          setDifficulty("Basic"), setShowDropDown(false);
                        }}
                      >
                        Basic
                      </div>
                    </li>
                    <li>
                      <div
                        className="block px-4 py-2 hover:bg-blue-600 hover:text-white w-full text-left cursor-pointer"
                        onClick={() => {
                          setDifficulty("Intermediate"), setShowDropDown(false);
                        }}
                      >
                        Intermediate
                      </div>
                    </li>
                    <li>
                      <div
                        className="block px-4 py-2 hover:bg-blue-600 hover:text-white w-full text-left cursor-pointer"
                        onClick={() => {
                          setDifficulty("Advanced"), setShowDropDown(false);
                        }}
                      >
                        Advanced
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div
              className={`flex flex-col items-center justify-center gap-2 ${!isButtonDisabled && "mt-4"
                }`}
            >
              {isButtonDisabled && (
                <div className=" text-center text-primary inline-flex items-center gap-1">
                  <IconInformationCircleOutline className="text-lg" /> Add more
                  credits to generate more outlines.
                </div>
              )}
              <div>
                <button
                  className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group text-sm sm:text-base ${isButtonDisabled || loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  type="submit"
                  disabled={isButtonDisabled}
                  onMouseEnter={() => setHoverButton(true)}
                  onMouseLeave={() => setHoverButton(false)}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{loading ? 'Generating...' : 'Generate Outline'}</span>
                  {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      {loading && <LoaderWater loadingMessage={loadingMessage} />}
      {data && !finalOutline && (
        <Questions
          data={data}
          topic={topic}
          additionalInfo={additionalInfo}
          client={client}
          difficulty={difficulty}
          setFinalOutline={setFinalOutline}
          onClose={() => {
            setData(undefined);
            setSelectedHeadings([]);
          }}
          targetAudience={selectedTargetAudience}
          cancelTwo={() => {
            setData(undefined);
            setTopic("");
            setAdditionalInfo("");
            setSelectedTargetAudience([]);
            setClient("");
            setDifficulty("");
            setSelectedHeadings([]);
          }}
          setSelectedSections={setSelectedHeadings}
          selectedSections={selectedHeadings}
        />
      )}
      {finalOutline && (
        <Outline
          data={finalOutline}
          onClose={handleClose}
          onBack={() => setFinalOutline(null)}
          inputTitle={topic}
        />
      )}
    </div>
  );
};

export default OutlineGenerator;
