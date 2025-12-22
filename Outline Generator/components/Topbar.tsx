"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import IconSignout from "@/public/icons/logout-icon";
import IconAccountCircleOutline from "@/public/icons/account-icon";
import { firestore } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import IconInformationCircleOutline from "@/public/icons/info-icon";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { signOutUser } from "@/lib/firebaseClient";
import { toast } from "react-toastify";
import IconHamburgerMenu from "@/public/icons/hamburger-icon";
import "react-toastify/dist/ReactToastify.css";
import { clearCookies } from "@/http/api";
import MobileNavbar from "./MobileNavbar";
import { Sparkles } from "lucide-react";

interface CreditsInfoProps {
  isProp?: boolean;
  onScrollToExample?: () => void;
}

const CreditsInfo: React.FC<CreditsInfoProps> = ({
  isProp,
  onScrollToExample,
}) => {
  const [displayName, setDisplayName] = useState<string>("");
  const [photoURL, setPhotoURL] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [profileMenu, setProfileMenu] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(0);
  const [showCreditsInfo, setShowCreditsInfo] = useState<boolean>(false);
  // const [refreshToken, setRefreshToken] = useState();

  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setProfileMenu(false);
    }
  };

  useEffect(() => {
    const handleCreditsUpdated = (event: CustomEvent<number>) => {
      setCredits(event.detail);
      console.log("Credits updated:", event.detail);
    };

    window.addEventListener(
      "creditsUpdated",
      handleCreditsUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        "creditsUpdated",
        handleCreditsUpdated as EventListener
      );
    };
  }, []);

  useEffect(() => {
    if (profileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenu]);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.displayName) {
          setDisplayName(user.displayName);
        }
        if (user.photoURL) {
          setPhotoURL(user.photoURL);
        }
        setEmail(user.email ?? "");
        const userRef = doc(firestore, "users", user.uid);
        getDoc(userRef)
          .then((docSnap) => {
            const userDb = docSnap.data();
            if (userDb) {
              setCredits(userDb.credits);
              if (userDb.credits <= 0) {
                const event = new CustomEvent<number>("not-enough-credits", {
                  detail: userDb.credits,
                });
                window.dispatchEvent(event);
              }
            }
          })
          .catch((error) => {
            toast.error("Error fetching user data");
            console.error(error);
          });
      } else {
        router.push("/auth/signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const logout = async () => {
    try {
      await signOutUser();
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      router.push("/auth/signin");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`gap-4 mb-2 items-center ${isProp ? "hidden md:flex" : "flex"}`}>
      {isProp && (
        <button
          className="flex font-semibold p-2 rounded-md items-center gap-2 text-gray-300 cursor-pointer hover:text-gray-500 transition-all duration-150 ease-in-out relative"
          onClick={onScrollToExample}
        >
          Examples
        </button>
      )}
      <div className="flex p-2  rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 items-center gap-2 text-white transition-all duration-150 ease-in-out relative">
        {/* <IconSparkles /> */}
        <Sparkles className="w-5 h-5" />
        <span className="text-base ">{credits} Outlines</span>
        <div
          onMouseEnter={() => setShowCreditsInfo(true)}
          onMouseLeave={() => setShowCreditsInfo(false)}
        >
          <IconInformationCircleOutline className=" text-xl" />
        </div>
        {showCreditsInfo && (
          <div className="bg-white text-black text-sm absolute rounded-xl w-[110%] border p-1 border-primary left-1/2 -translate-x-1/2 top-[130%]">
            <p className="text-center">
              This outline is generated using the advanced capabilities of
              AI. Each outline incurs a cost of one credit.
            </p>
          </div>
        )}
      </div>
      {email && email.length > 0 && (
        <div className="items-center" ref={menuRef}>
          <div
            className=" cursor-pointer rounded-full p-1 z-50"
            onClick={() => {
              setProfileMenu(!profileMenu);
            }}
          >
            {photoURL && photoURL.length > 0 ? (
              <Image
                src={photoURL}
                alt="user"
                width={34}
                height={34}
                className="rounded-full"
              />
            ) : (
              <Image
                src={"/outline-gen/icons/user.png"}
                alt="user"
                width={34}
                height={34}
                style={{
                  backgroundColor: "lightgray",
                  borderRadius: "50%",
                  padding: "3px",
                }}
              />
            )}
          </div>
          {profileMenu && (
            <div className=" flex flex-col border border-primary rounded-xl p-2 absolute w-[12rem] bg-white top-[95%] right-6">
              {email && displayName && displayName.length > 0 ? (
                <p className="">{displayName}</p>
              ) : (
                <p className=" ">{email}</p>
              )}
              <div className="mt-1 border-t pt-0">
                {/* <div className="flex items-center gap-2 text-base cursor-pointer hover:bg-custom-gray rounded p-1">
                  <IconAccountCircleOutline />
                  <span>Your account</span>
                </div> */}
                <div
                  className="flex items-center gap-2 text-base cursor-pointer hover:bg-custom-gray rounded p-1"
                  onClick={logout}
                >
                  <IconSignout />
                  <span>Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface TopbarProps {
  onScrollToExample: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onScrollToExample }) => {
  const [showMobileNav, setShowMobileNav] = useState<boolean>(false);

  return (
    <div className="flex gap-4 p-4 justify-between items-center bg-black relative z-40 h-[10vh] pt-12">
      {/* <ToastContainer
        position="top-center"
        style={{ width: "98%", padding: "0"}}
      /> */}
      <a href="https://www.infrasity.com" rel="noopener noreferrer">
        <Image
          src="/outline-gen/icons/infrasity_logo_signup.svg"
          alt="logo"
          height={180}
          width={180}
          className="md:absolute left-4 top-5 bottom-3.5"
        />
      </a>
      {/* <Image
        src="/icons/infrasity_logo.png"
        alt="logo"
        height={180}
        width={180}
        className=""
      /> */}
      <CreditsInfo isProp={true} onScrollToExample={onScrollToExample} />

      <div
        onClick={() => setShowMobileNav(!showMobileNav)}
        // className="cursor-pointer"
        className="md:hidden text-3xl cursor-pointer"
      >
        <IconHamburgerMenu className="text-white" />
      </div>
      {showMobileNav && (
        <MobileNavbar
          CreditsInfo={CreditsInfo}
          setShowMobileNav={setShowMobileNav}
        />
      )}
    </div>
  );
};

export default Topbar;
