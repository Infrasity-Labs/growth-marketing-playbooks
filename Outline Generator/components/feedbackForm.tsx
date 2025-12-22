import React, { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import LoaderWater from "./LoaderWater";

interface FeedbackFormProps {
  onClose: (feedbackSubmitted: boolean) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onClose }) => {
  const [user, setUser] = useState<User>();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (rating === null || comment === "") {
        setLoading(false);
        toast.error("Error! Please fill all the fields.");
        return;
      }
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const history = userData.history || [];

          if (history.length > 0) {
            const lastIndex = history.length - 1;
            history[lastIndex].feedbackRating = rating;
            history[lastIndex].feedbackComment = comment;
          }

          await updateDoc(userDocRef, { history });

          setLoading(false);
          
          onClose(true);
        } else {
          console.log("No such document!");
          setLoading(false);
          toast.error("Error! submitting feedback.");
          onClose(false);
        }
      }
    } catch (error) {
      console.log("No user is signed in.");
      setLoading(false);
      toast.error("Error! submitting feedback.");
      onClose(false);
    }
  };

  return (
    <>
      {loading ? (
        <LoaderWater loadingMessage={"Loading please wait..."} />
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-500 bg-opacity-50 backdrop-blur-sm z-50 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl h-auto mx-auto bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto px-12">
            <h1 className="lg:text-4xl md:text-3xl text-2xl font-bold mb-2 font-inter pt-10">
              Rate us!
            </h1>
            <p className=" text-gray-300 mb-8 lg:text-lg md:text-md sm:text-md text-sm font-medium font-inter">
              Your input is super important in helping us understand your needs
              better, so we can customize our services to suit you perfectly.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <p className="mb-3 text-xl font-semibold font-inter">
                  How would you rate our content generator?
                </p>
                <div className="flex justify-between flex-wrap gap-2 sm:gap-4 py-5">
                  <button
                    type="button"
                    className={`flex items-center justify-center w-11 h-11 sm:w-15 sm:h-15 md:w-24 md:h-24 text-lg sm:text-3xl md:text-5xl p-2 rounded-full border ${
                      rating === 1
                        ? "bg-selection-primary"
                        : "border-gray-200 bg-transparent"
                    }`}
                    onClick={() => setRating(1)}
                  >
                    😠
                  </button>
                  <button
                    type="button"
                    className={`flex items-center justify-center w-11 h-11 sm:w-15 sm:h-15 md:w-24 md:h-24 text-lg sm:text-3xl md:text-5xl p-2 rounded-full border ${
                      rating === 2
                        ? "bg-selection-primary"
                        : "border-gray-200 bg-transparent"
                    }`}
                    onClick={() => setRating(2)}
                  >
                    😞
                  </button>
                  <button
                    type="button"
                    className={`flex items-center justify-center w-11 h-11 sm:w-15 sm:h-15 md:w-24 md:h-24 text-lg sm:text-3xl md:text-5xl p-2 rounded-full border ${
                      rating === 3
                        ? "bg-selection-primary"
                        : "border-gray-200 bg-transparent"
                    }`}
                    onClick={() => setRating(3)}
                  >
                    😑
                  </button>
                  <button
                    type="button"
                    className={`flex items-center justify-center w-11 h-11 sm:w-15 sm:h-15 md:w-24 md:h-24 text-lg sm:text-3xl md:text-5xl p-2 rounded-full border ${
                      rating === 4
                        ? "bg-selection-primary"
                        : "border-gray-200 bg-transparent"
                    }`}
                    onClick={() => setRating(4)}
                  >
                    😊
                  </button>
                  <button
                    type="button"
                    className={`flex items-center justify-center w-11 h-11 sm:w-15 sm:h-15 md:w-24 md:h-24 text-lg sm:text-3xl md:text-5xl p-2 rounded-full border ${
                      rating === 5
                        ? "bg-selection-primary"
                        : "border-gray-200 bg-transparent"
                    }`}
                    onClick={() => setRating(5)}
                  >
                    🥰
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <textarea
                  className="w-full h-32 p-2 border border-gray-400 rounded-lg font-inter"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-purple-600"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackForm;
