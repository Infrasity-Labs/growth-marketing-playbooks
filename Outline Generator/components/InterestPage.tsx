"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WorkInput  from '@/components/WorkInput';
import { useSearchParams } from 'next/navigation'
import { workInputs } from "@/static-content/work-interest-input";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { toast } from 'react-toastify';

const InterestPage = () => {

  const [selectedInterest, setSelectedInterest] = useState<string | string[]>('');
  const [userUid, setUserUid] = useState<string>("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const work = searchParams.get('work') || '';
  const selectedWorkInput = workInputs.find(input => input.title === work);

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
    router.push('/intro/work')
  }

  const handleContinue = () => {
    if (!selectedInterest) return toast.error('Please select an interest');
    const userRef = doc(firestore, "users", userUid);
    updateDoc(userRef, {
      interests: selectedInterest,
    });
    router.push('/')
  }

  return (
    <div className="flex flex-col gap-12 flex-1 justify-center w-fit z-50">
      <WorkInput
        primeQuestion="What interests you?"
        secondaryQuestion="Select the option that most closely aligns with your interests. We'll use this to tailor your experience."
        inputs={selectedWorkInput?.interests || []}
        onSelect={(interest) => setSelectedInterest(interest)}
        selected={selectedInterest}
        multiSelect={true}
        isWork={false}
      />
      <div className="flex items-center gap-12 text-sm justify-end pr-4 mb-10">
        <button className="text-gray-400 hover:text-gray-500" onClick={handleBack}>Back</button>
        <button
          className="px-8 py-2 bg-primary hover:bg-primary-dark text-white rounded-full font-semibold"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default InterestPage;
