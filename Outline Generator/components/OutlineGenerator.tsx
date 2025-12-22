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
import LoaderWater from "./LoaderWater";
import useFeatureToggle from "@/hooks/useFeatureToggle";
import error from "next/error";

import IconInformationCircleOutline from "@/public/icons/info-icon";
import { useRouter } from "next/navigation";

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
            userId: user.uid,
            token
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

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 py-10 w-[100%] bg-white rounded-2xl text-text-primary shadow-md">
      {/* <ToastContainer
        position="top-center"
        style={{ width: "98%", padding: "0" }}
      /> */}
      {/* <div>
        {isFeatureAEnabled ? (
          <div>Feature A is enabled</div>
        ) : (
          <div>Feature A is disabled</div>
        )}
      </div> */}
      <div className=" text-center rounded-full bg-primary px-3 text-white opacity-65 py-1 inline-flex items-center gap-1">
        <IconInformationCircleOutline />
        For this free version, you have been provided with 2 free outlines.
      </div>
      <div className=" text-black font-medium text-5xl text-center relative ">
        Infrasity Outline Generator <br /> Tool
        <Image
          src="/outline-gen/icons/curved_line.svg"
          alt=""
          width={177}
          height={3}
          className="absolute top-14 left-0 max-[850px]:hidden"
        />
      </div>
      <p className="text-lg text-center">
        Use AI to spend less time organizing your thoughts and more time
        creating engaging content.
      </p>
      <form
        id="form"
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-center gap-2 w-full sm:w-[70%] xl:w-[55rem] border-[3px] border-primary py-5 px-6 md:px-24 rounded-2xl"
      >
        <h1 className="font-medium text-3xl text-center">
          AI Outline Generator
        </h1>
        <p>Fill the fields to generate an outline</p>
        <div className="flex items-center w-full gap-2">
          <div className="flex flex-col w-full relative rounded-xl space-y-2">
            <label
              htmlFor=""
              className={`${isButtonDisabled && "text-gray-400"
                } self-start ml-0 font-semibold`}
            >
              Topic
            </label>
            <input
              disabled={isButtonDisabled}
              required
              id="topic"
              className="outline-gen-input"
              type="text"
              value={topic}
              placeholder="E.g Bitcoin behind the scenes"
              onChange={(e) => {
                setTopic(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col w-full relative rounded-xl space-y-2">
          <label
            htmlFor="topic"
            className={`${isButtonDisabled && "text-gray-400"
              } self-start ml-0 font-semibold`}
          >
            Additional Information
          </label>
          <input
            // rows={1}
            disabled={isButtonDisabled}
            id="client"
            className="outline-gen-input"
            value={additionalInfo}
            placeholder="E.g Tell about bitcoin focusing on the blockchain part of it"
            onChange={(e) => {
              setAdditionalInfo(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col w-full relative rounded-xl space-y-2">
          <label
            htmlFor="topic"
            className={`${isButtonDisabled && "text-gray-400"
              } self-start ml-0 font-semibold`}
          >
            Target Audience
          </label>
          <div className="w-full">
            <ReactTags
              allowNew
              // onValidate={onValidate}
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
        </div>
        <div className="flex items-center w-full gap-4">
          <div className="flex flex-col flex-1 relative h-fullrounded-xl space-y-2">
            <label
              htmlFor=""
              className={`${isButtonDisabled && "text-gray-400"
                } self-start ml-0 font-semibold truncate`}
            >
              Client Name
            </label>
            <input
              disabled={isButtonDisabled}
              id="topic"
              className="outline-gen-input h-full"
              type="text"
              value={client}
              placeholder="E.g Google"
              onChange={(e) => {
                setClient(e.target.value);
              }}
            />
          </div>
          <div className="w-[50%] flex flex-col relative rounded-xl space-y-2">
            <label
              htmlFor="difficulty"
              className={`${isButtonDisabled && "text-gray-400"
                } self-start ml-0 font-semibold truncate`}
            >
              Content Depth
            </label>
            <div
              id="dropdownDefaultButton"
              onClick={() => {
                if (!isButtonDisabled) setShowDropDown(!showDropDown);
              }}
              className={`h-[41px] justify-between text-text-primary ${isButtonDisabled ? "bg-disabled" : "bg-white cursor-pointer"
                } border-2 border-text-primary  focus:outline-none  font-medium rounded-xl p-[0.57rem] text-center inline-flex items-center  whitespace-nowrap overflow-hidden"
              type="button`}
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
                } absolute top-[105%] left-0 bg-white divide-y divide-gray-100 rounded-xl w-full shadow-xl border border-gray-300`}
            >
              <ul
                className="py-2 text-sm text-text-primary "
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
          <div
            className={` p-[3px] rounded-[18px] w-fit flex items-center justify-center ${isButtonDisabled
                ? "cursor-not-allowed bg-gray-400"
                : hoverButton
                  ? "bg-primary"
                  : "bg-button-gradient"
              } transition-all duration-150 ease-in-out`}
          >
            <button
              className={`bg-white rounded-[15px] font-semibold py-2 px-6 w-fit flex items-center justify-center ${isButtonDisabled
                  ? "cursor-not-allowed bg-gray-300 text-gray-400"
                  : "hover:bg-primary hover:text-white"
                } transition-all duration-150 ease-in-out`}
              type="submit"
              disabled={isButtonDisabled}
              onMouseEnter={() => setHoverButton(true)}
              onMouseLeave={() => setHoverButton(false)}
            >
              Generate Outline
            </button>
          </div>
        </div>
      </form>
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
