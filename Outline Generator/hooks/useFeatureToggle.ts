import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import axios from "axios";

const useFeatureToggle = () => {
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const [userUid, setUserUid] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        const result = await axios.get(`/outline-gen/api/check-feature?id=${user.uid}`);
        if (userUid && result.data.result) {
          setIsFeatureEnabled(true);
        } else {
          setIsFeatureEnabled(false);
        }
      } else {
        setUserUid("");
      }
    });

    return () => unsubscribe();
  }, [userUid]);

  return isFeatureEnabled;
};

export default useFeatureToggle;
