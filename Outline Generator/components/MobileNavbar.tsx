"use client";
import { useState, useEffect } from "react";
import { OutlineType } from "@/domain/outline";
import IconAdd from "@/public/icons/add-icon";
import IconSettingsOutline from "@/public/icons/settings-icon";
import History from "./History";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseClient";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import IconCloseCircle from "@/public/icons/close-icon";

interface PreviousOutline {
  topic: string;
  outline: OutlineType;
  additionalInfo: string;
  client: string;
  date: string;
  difficulty: string;
}

interface MobileNavbarProps {
  CreditsInfo: React.FC;
  setShowMobileNav: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({
  CreditsInfo,
  setShowMobileNav,
}) => {
  const [previousOutlines, setPreviousOutlines] = useState<PreviousOutline[]>(
    []
  );

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

  return (
    <div className="absolute h-screen top-0 right-0 p-4 bg-black w-[70%] md:hidden shadow-2xl ">
      <ul className="flex flex-col gap-3">
        <li className="flex items-center justify-between mb-8 relative">
          <div
            onClick={() => setShowMobileNav(false)}
          >
            <IconCloseCircle className=" hover:text-primary-dark cursor-pointer transition-all" />
          </div>
          <CreditsInfo />
        </li>
        <hr />
        <li className="sidebar-elements-active">
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
        <li className=" sidebar-elements bg-[#9CA3AF]">
          <IconSettingsOutline className="text-lg" />
          <p className="truncate">Settings</p>
        </li>
        {previousOutlines && previousOutlines.length > 0 && (
          <History previousOutlines={previousOutlines} />
        )}
      </ul>
    </div>
  );
};

export default MobileNavbar;
