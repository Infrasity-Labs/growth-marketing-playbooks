"use client";

import Link from "next/link";
import IconGoogle from "@/public/icons/google-icon";
import IconMail from "@/public/icons/mail-icon";
import IconLockPasswordLine from "@/public/icons/pass-icon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signinWithGoogle } from "@/service/firebase-auth-service";
import { FireBaseErrors } from "@/errors/firebase-errors";
import { signinWithEmail } from "@/service/firebase-auth-service";
import Image from "next/image";
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

const SigninForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // State for loading
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
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setLoading(true);
      e.preventDefault();
      const res = await signinWithEmail(email, password);
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
      } else if (error instanceof FireBaseErrors.INVALID_CRED) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.error("Unknown error. Please try again.");
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center w-80 min-[480px]:w-[28rem] h-[80%] text-sm px-8 rounded-lg relative overflow-y-auto">
      {/* Error Popup */}
      {/* <ToastContainer
        position="top-center"
        style={{ width: "98%", padding: "0" }}
      /> */}
      {
        showSuccess && (
          <SuccessMessage />
        )
      }
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75 z-50">
          <Oval color="#6b5be5" secondaryColor="#8380eb" height={80} width={80} />
          <p className="mt-4 text-lg font-medium">Signing in...</p>
        </div>
      )} {!loading && (
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
            <h1 className=" text-xl min-[480px]:text-3xl font-semibold font-inter text-center px-4 md:px-0">
              Log in to <span className="custom-text-gradient">Infrasity</span>
            </h1>
          </div>
          <button
            className="flex items-center gap-2 relative btn-secondary w-full font-semibold mb-4"
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
            {/* <IconGoogle className="mr-2 md:mr-0 md:absolute left-3 text-xl" /> */}
            Continue with Google
          </button>
          <form
            className=" flex flex-col gap-3 w-full"
            onSubmit={handleEmailSignin}
          >
            <p className=" text-center text-text-primary text-sm cus-line">Or</p>
            <div className="relative w-full space-y-1 ">
              <label htmlFor="email" className="font-semibold">
                Email
              </label>
              <input
                className="input-cus"
                type="email"
                placeholder="e.g name@company.com"
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                required
              />
            </div>
            <div className="relative w-full space-y-1">
              <label htmlFor="password" className="font-semibold">
                Password
              </label>
              <input
                className="input-cus"
                type="password"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                required
              />
              {/* <div className="flex justify-end">
                <a
                  href="#"
                  className=" underline text-primary text-xs font-semibold"
                >
                  Forgot Password?
                </a>
              </div> */}
            </div>
            <button
              className={`bg-primary text-white rounded-xl p-2 flex items-center justify-center mt-4 hover:bg-primary-dark transition-all`}
              type="submit"
            >
              Log In
            </button>
          </form>
          <div className=" text-text-primary font-semibold text-sm -mt-2">
            New to infrasity?{" "}
            <Link href="/auth/signup" className=" text-primary">
              Create account
            </Link>
          </div>
          <div className="text-gray-700 text-[9px] absolute left-1/2 -translate-x-1/2 font-inter bottom-0 text-center text-nowrap">
            &copy; Infrasity Pvt. Ltd. All Rights Reserved
          </div>
        </div>
      )}
      {/* <p className="text-gray-400 text-[9px] absolute left-1/2 -translate-x-1/2 bottom-0 text-nowrap">
        &copy; Infrasity Pvt. Ltd. All Rights Reserved
      </p> */}
    </div>
  );
};

export default SigninForm;
