"use client";

import Link from "next/link";
import IconGoogle from "@/public/icons/google-icon";
import IconMail from "@/public/icons/mail-icon";
import IconFirstName from "@/public/icons/firstname-icon";
import IconLastName from "@/public/icons/lastname-icon";
import IconLockPasswordLine from "@/public/icons/pass-icon";
import { FireBaseErrors } from "@/errors/firebase-errors";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import Image from "next/image";
import { signinWithGoogle } from "@/service/firebase-auth-service";
import { signUpWithEmail } from "@/service/firebase-auth-service";
import { ToastContainer, toast } from "react-toastify";
import { Oval } from "react-loader-spinner";
import "react-toastify/dist/ReactToastify.css";

const SuccessMessage = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50">
      <Oval color="#6b5be5" secondaryColor="#8380eb" height={80} width={80} />
      <p className="mt-4 text-lg font-medium">Redirecting...</p>
    </div>
  );
};

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();

  const handleGoogleSignin = async () => {
    try {
      setLoading(true);
      const res = await signinWithGoogle();
      if (res === true) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push("/intro/work");
        }, 2000); // Adjust the delay as needed
      } else {
        setShowSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (error) {
      if (error instanceof FireBaseErrors.EMAIL_EXISTS) {
        toast.error("Email already exists. Please sign in with email.");
      } else if (error instanceof FireBaseErrors.CREDENTIAL_ALREADY_IN_USE) {
        toast.error("Credential already in use. Please sign in with email.");
      } else if (error instanceof FireBaseErrors.INVALID_PASSWORD) {
        toast.error("Invalid password. Please try again.");
      } else if (error instanceof FireBaseErrors.NO_AUTH_EVENT) {
        toast.error("Auth event not found. Please try again.");
      } else if (error instanceof FireBaseErrors.OPERATION_NOT_ALLOWED) {
        toast.error("Operation not allowed. Please try again.");
      } else if (error instanceof FireBaseErrors.OPERATION_NOT_SUPPORTED) {
        toast.error(
          "Operation not supported in this environment. Please try again."
        );
      } else if (error instanceof FireBaseErrors.USER_DELETED) {
        toast.error("User not found. Please try again.");
      } else if (error instanceof FireBaseErrors.REJECTED_CREDENTIAL) {
        toast.error("Rejected credential. Please try again.");
      } else if (error instanceof FireBaseErrors.POPUP_CLOSED_BY_USER) {
        return;
      } else if (error instanceof FireBaseErrors.EXPIRED_POPUP_REQUEST) {
        return;
      } else if (error instanceof FireBaseErrors.POPUP_BLOCKED) {
        toast.error("Popup blocked by browser. Please try again.");
      } else {
        toast.error("Unknown error. Please try again.");
      }
      setLoading(false);
      setShowSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setLoading(true);
      e.preventDefault();
      const res = await signUpWithEmail(email, password, firstName, lastName);
      if (res === true) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push("/intro/work");
        }, 2000); // Adjust the delay as needed
      } else {
        setShowSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (error) {
      if (error instanceof FireBaseErrors.EMAIL_EXISTS) {
        toast.error("Email already exists. Please sign in with email.");
      } else if (error instanceof FireBaseErrors.CREDENTIAL_ALREADY_IN_USE) {
        toast.error("Credential already in use. Please sign in with email.");
      } else if (error instanceof FireBaseErrors.INVALID_PASSWORD) {
        toast.error("Invalid password. Please try again.");
      } else if (error instanceof FireBaseErrors.NO_AUTH_EVENT) {
        toast.error("Auth event not found. Please try again.");
      } else if (error instanceof FireBaseErrors.OPERATION_NOT_ALLOWED) {
        toast.error("Operation not allowed. Please try again.");
      } else if (error instanceof FireBaseErrors.OPERATION_NOT_SUPPORTED) {
        toast.error(
          "Operation not supported in this environment. Please try again."
        );
      } else if (error instanceof FireBaseErrors.USER_DELETED) {
        toast.error("User not found. Please try again.");
      } else if (error instanceof FireBaseErrors.REJECTED_CREDENTIAL) {
        toast.error("Rejected credential. Please try again.");
      } else if (error instanceof FireBaseErrors.POPUP_CLOSED_BY_USER) {
        return;
      } else if (error instanceof FireBaseErrors.EXPIRED_POPUP_REQUEST) {
        return;
      } else if (error instanceof FireBaseErrors.POPUP_BLOCKED) {
        toast.error("Popup blocked by browser. Please try again.");
      } else {
        toast.error("Unknown error. Please try again.");
      }
      setLoading(false);
      setShowSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center w-80 min-[480px]:w-[28rem] h-screen text-sm px-8 rounded-lg relative overflow-y-auto">
      {/* <ToastContainer
        position="top-center"
        style={{ width: "98%", padding: "0" }}
      /> */}
      {showSuccess && <SuccessMessage />}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75 z-50">
          <Oval
            color="#6b5be5"
            secondaryColor="#8380eb"
            height={80}
            width={80}
          />
          <p className="mt-4 text-lg font-medium">Signing up...</p>
        </div>
      )}{" "}
      {!loading && (
        <div className="flex flex-col items-center justify-center w-full gap-4">
          <Image
            className=""
            src="/outline-gen/icons/infrasity-small-logo.svg"
            alt="logo"
            width={28}
            height={28}
            priority
          />
          <div className="flex flex-col items-center">
            <h1 className=" text-2xl min-[480px]:text-4xl font-medium font-inter text-center px-4 md:px-0">
              Sign Upto <span className="custom-text-gradient">Infrasity</span>
            </h1>
            <p className=" text-black-400 text-center w-[70%] font-inter font-regular pt-2">
              Unlock the full potential of your writing with structured outlines
            </p>
          </div>
          <button
            className="flex items-center gap-2 relative btn-secondary w-full font-inter font-semibold mb-4 "
            onClick={handleGoogleSignin}
          >
            <Image
              className=""
              src="/outline-gen/icons/google-icon.svg"
              alt="logo"
              width={16}
              height={16}
              priority
            />
            Continue with Google
          </button>
          <form
            className=" flex flex-col gap-3 w-full"
            onSubmit={handleEmailSignup}
          >
            <p className=" text-center text-text-primary text-sm cus-line">
              Or
            </p>

            <div className="flex flex-col md:flex-row md:space-x-4 w-full space-y-1 font-inter md:space-y-0 md:items-end">
              <div className="relative w-full">
                <label htmlFor="firstname" className="font-semibold font-inter">
                  Name
                </label>
                <input
                  className="input-cus font-inter"
                  type="text"
                  placeholder="First name"
                  onChange={(e) => setFirstName(e.target.value)}
                  id="firstname"
                  required
                />
              </div>
              <div className="relative w-full">
                <label htmlFor="lastname" className="font-regular"></label>
                <input
                  className="input-cus font-inter"
                  type="text"
                  placeholder="Last name"
                  onChange={(e) => setLastName(e.target.value)}
                  id="lastname"
                  required
                />
              </div>
            </div>
            <div className="relative w-full font-inter space-y-1 ">
              <label htmlFor="email" className="font-semibold font-inter">
                Email
              </label>
              <input
                className="input-cus font-inter"
                type="email"
                placeholder="e.g name@company.com"
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                required
              />
            </div>
            <div className="relative w-full font-inter space-y-1">
              <label htmlFor="password" className="font-semibold font-inter">
                Password
              </label>
              <input
                className="input-cus font-inter"
                type="password"
                placeholder="Create your password"
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                required
              />
              {/* <div className="flex justify-start items-start gap-2">
                <input type="checkbox" className=" accent-primary mt-1 cursor-pointer" />
                <p>
                  I have a read and agree to the{" "}
                  <a
                    href=""
                    className=" text-primary text-xs font-semibold"
                  >
                    Terms and Conditions
                  </a>{" "}
                  &{" "}
                  <a
                    href=""
                    className=" text-primary text-xs font-semibold"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div> */}
            </div>
            {password.length < 6 && password.length > 0 && (
              <p className=" text-red-500 text-xs text-center">
                Password must be at least 6 characters
              </p>
            )}
            <button
              className={`bg-primary cursor-pointer text-white rounded-xl p-2 flex items-center font-inter justify-center mt-4 hover:bg-primary-dark transition-all`}
              type="submit"
              disabled={password.length < 6 && password.length >= 0}
            >
              Create your account
            </button>
          </form>
          <div className=" text-text-primary font-semibold font-inter text-sm -mt-2">
            Already have an account?{" "}
            <Link href="/auth/signin" className=" text-primary">
              Log In
            </Link>
          </div>
          <div className="text-gray-700 text-[9px] absolute left-1/2 -translate-x-1/2 font-inter bottom-0 text-center text-nowrap">
            &copy; Infrasity Pvt. Ltd. All Rights Reserved
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupForm;
