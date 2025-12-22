import { OutlineType } from "@/domain/outline";
import ExportPDFButton from "./ExportPDFbtn";
import ExportDOCXbtn from "./ExportDOCXbtn";
import Image from "next/image";
import { useEffect, useState } from "react";
import FeedbackForm from "./feedbackForm";
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { ToastContainer, toast } from "react-toastify";
import error from "next/error";

interface BottomBarProps {
  isStepOne: boolean;
  data?: OutlineType;
  nextStep?: () => void;
  cancel?: () => void;
  cancelTwo?: () => void;
  isExample?: boolean;
  onBack?: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({
  isStepOne,
  data,
  nextStep,
  cancel,
  isExample,
  cancelTwo,
  onBack,
}) => {

  const [uid, setUid] = useState<string | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false); // State to control the visibility of the FeedbackForm
  const [isFeedback, setIsFeedback] = useState(false);
  const db = getFirestore();

  const handleExportClick = () => {
    setShowFeedbackForm(true); // Show the FeedbackForm when export button is clicked
  };

  const handleFeedbackClose = async (feedbackSubmitted: boolean) => {

    if (feedbackSubmitted) {
      console.log("inside handleFeedbackClose: " + feedbackSubmitted);
      toast.success("Thankyou! for your feedback.");
      setShowFeedbackForm(false);
      setIsFeedback(true);
    }
    else {
      console.log("else block handleFeedbackClose: " + feedbackSubmitted);
      toast.error("Error! submitting feedback.");
      setIsFeedback(false);
    }
  };

  const checkFeedback = async (userUid: string) => {
    try {
      const userDocRef = doc(db, "users", userUid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const history = userData.history || [];
        if (history.length > 0) {
          const lastHistoryEntry = history[history.length - 1];
          if (lastHistoryEntry.feedbackComment && lastHistoryEntry.feedbackRating) {
            setIsFeedback(true);
            return;
          }
          else {
            setIsFeedback(false);
            return;
          }
        }
      }
    } catch (error) {
      console.error("Error checking feedback:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        checkFeedback(user.uid);
      } else {
        setUid(null);
        setIsFeedback(false);
      }
    });

    return () => unsubscribe();
  }, [checkFeedback]);

  return (
    <div className="bottom-0 left-0 w-full flex z-10 inset-1">
      <div className="bottom-0 left-0 bg-black p-4 md:p-8 w-full flex border-t border-text-primary justify-between">
        <div className="flex items-center gap-3 sm:gap-12 flex-col sm:flex-row">
          <button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border text-white border-gray-600 rounded-xl p-2 font-semibold text-sm sm:text-base w-[8rem] sm:w-[10rem] transition-all"
            onClick={onBack ? onBack : cancel}
          >
            {!isExample ? "Back" : "Close"}
          </button>
          {!isExample && (
            <button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border text-white border-gray-600 rounded-xl p-2 font-semibold text-sm sm:text-base w-[8rem] sm:w-[10rem] transition-all"
              onClick={cancelTwo ? cancelTwo : cancel}
            >
              {isStepOne ? "Cancel" : "Close"}
            </button>
          )}
        </div>
        {isStepOne ? (
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl p-2 text-white hover:bg-primary-dark font-semibold text-sm sm:text-base w-[8rem] sm:w-[10rem] transition-all flex items-center justify-center gap-4 cursor-pointer"
            onClick={nextStep}
          >
            <span>Next</span>
            <Image
              src="/outline-gen/icons/right-white-arrow-icon.svg"
              alt=""
              height={6}
              width={6}
            />
          </div>
        ) : (
          <>
            {data && (
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-12">
                {isExample || isFeedback ? (
                  <ExportDOCXbtn outline={data} />
                ) : (
                  <button onClick={handleExportClick}>
                    <ExportDOCXbtn outline={data} />
                  </button>
                )}
                {isExample || isFeedback ? (
                  <ExportPDFButton data={data} />
                ) : (
                  <button onClick={handleExportClick}>
                    <ExportPDFButton data={data} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {showFeedbackForm && uid && (
        <FeedbackForm onClose={handleFeedbackClose} /> // Render the FeedbackForm and pass the onClose handler
      )}
    </div>
  );
};


export default BottomBar;
