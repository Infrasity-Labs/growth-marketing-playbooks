import type { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseClient";

const saveUser = async (user: User) => {
  try {
    const userRef = doc(firestore, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
        credits: 2,
      });
      return true;
    } else {
      const userData = docSnap.data();
      if(!userData.work || !userData.interests || userData.interests.length === 0){
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error(error);
  }
};

const saveUser2 = async (user: User, firstName: string = 'firstName', lastName: string = 'lastName') => {
  try {
    const userRef = doc(firestore, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        name: `${firstName} ${lastName}`,
        photoURL: "",
        uid: user.uid,
        credits: 2,
      });
      return true;
    } else {
      const userData = docSnap.data();
      if(!userData.work || !userData.interests || userData.interests.length === 0){
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error(error);
  }
}

export { saveUser, saveUser2 };