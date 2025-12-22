"use client";
import IconAdd from "@/public/icons/add-icon";
import IconSettingsOutline from "@/public/icons/settings-icon";
import History from "./History";
import { OutlineType } from "@/domain/outline";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore, signOutUser } from "@/lib/firebaseClient";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import LoaderWater from "./LoaderWater";
import { useRouter } from "next/navigation";
import { HistoryOutline } from "@/domain/historyOutline";

interface PreviousOutline {
  topic: string;
  outline: OutlineType;
  additionalInfo: string;
  client: string;
  date: string;
  difficulty: string;
}

const Sidebar = () => {
  const [previousOutlines, setPreviousOutlines] = useState<PreviousOutline[]>(
    []
  );
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        const userRef = doc(firestore, "users", uid);
        getDoc(userRef).then((docSnap) => {
          const userDb = docSnap.data();
          if (userDb) {
            if (!userDb.history) return;
            const history = userDb.history;
            const reversedHistory = history.reverse();
            setPreviousOutlines(reversedHistory);
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleUpdateHistory = (event: CustomEvent<HistoryOutline>) => {
      // let currentPrevOutlines = previousOutlines;
      // console.log(currentPrevOutlines);
      // currentPrevOutlines.push(event.detail);
      // currentPrevOutlines.reverse();
      setPreviousOutlines((prev) => [event.detail, ...prev]);
      console.log('History updated')
    };

    window.addEventListener(
      "outline-generated",
      handleUpdateHistory as EventListener
    );

    return () => {
      window.removeEventListener(
        "outline-generated",
        handleUpdateHistory as EventListener
      );
    };
  }, []);

  return (
    <div className=" hidden md:block p-4 w-[20%] bg-side-blue">
      {showLoader && <LoaderWater loadingMessage="" />}
      {/* <Image
        src="/icons/infrasity_logo.png"
        alt="logo"
        height={150}
        width={150}
        className=""
      /> */}

      <ul className="flex flex-col gap-3">
        <li
          className="sidebar-elements-active"
          onClick={() => {
            setShowLoader(true);
            router.push("/");
            setInterval(() => {
              setShowLoader(false);
            }, 1500);
          }}
        >
          <IconAdd className="text-lg" />
          <p className="truncate">New Outline</p>
        </li>
        {/* <li className=" sidebar-elements">
          <IconTemplate />
          <p className="text-sm">Templates</p>
        </li>
        <li className=" sidebar-elements">
          <IconBxsBookContent />
          <p className="text-sm">Outlines</p>
        </li> */}
        {/* <li className=" sidebar-elements">
          <IconSettingsOutline className="text-lg" />
          <p className="truncate">Settings</p>
        </li> */}
        {previousOutlines && previousOutlines.length > 0 && (
          <History previousOutlines={previousOutlines} />
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
