"use client";
import WorkInput from "@/components/WorkInput";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { workInputs } from "@/static-content/work-interest-input";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseClient";
import { toast } from "react-toastify";

const WorkPage = () => {
  const [selectedWork, setSelectedWork] = useState<string | string[]>("");
  const [userUid, setUserUid] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        setUserUid(uid);
      } else {
        router.push("/auth/signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleBack = () => {
    router.push("/auth/signup");
  };

  const handleContinue = () => {
    if (!selectedWork) return alert("Please select a work");
    if(selectedWork === 'Other'){
      return toast.error('Please input your work');
    }
    const userRef = doc(firestore, "users", userUid);
    updateDoc(userRef, {
      work: selectedWork,
    });
    router.push(`/intro/interests?work=${selectedWork}`);
  };

  return (
    <div className="bg-black flex flex-col gap-12 flex-1 justify-center w-fit z-50">
      {/* <div className="flex flex-col gap-12 flex-1 justify-center w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto p-4"> */}
      <WorkInput
        primeQuestion="What is kind of work do you do?"
        secondaryQuestion="Select the option that most closely aligns with your daily responsibilities. We'll use this to tailor your experience."
        inputs={workInputs}
        onSelect={(work) => setSelectedWork(work)}
        selected={selectedWork}
        isWork={true}
      />

      <div className="w-full px-8 border border-b-1 border-white"></div>

      <div className="flex items-center gap-12 text-sm justify-end pr-4 mb-10">
        <button
          className="text-gray-200 hover:text-gray-300"
          onClick={handleBack}
        >
          Back
        </button>
        <button
          className="px-8 py-2 bg-primary hover:bg-primary-dark text-white rounded-full font-semibold"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WorkPage;
