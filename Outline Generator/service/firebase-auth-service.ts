import {
  GoogleAuthProvider,
  signInWithPopup,
  browserPopupRedirectResolver,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError,
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { saveUser, saveUser2 } from "@/service/firebase-db-service";
import { FireBaseErrors } from "@/errors/firebase-errors";
import { setIdTokenCookie, sendError, setRefreshTokenInCookie } from "@/http/api";

const signinWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    const user = result.user;
    const res = await saveUser(user);
    const token = await user.getIdToken();
    const refreshToken = await user.refreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refresh_token', refreshToken);
    // Set refresh token as a cookie for backend access
    document.cookie = `refresh_token=${refreshToken}; path=/; secure; samesite=strict`;
    return res;
  } catch (error) {
    await sendError(error);
    if ((error as AuthError).code === "auth/popup-closed-by-user") {
      throw new FireBaseErrors.POPUP_CLOSED_BY_USER("Popup closed by user");
    } else if ((error as AuthError).code === "auth/popup-blocked") {
      throw new FireBaseErrors.POPUP_BLOCKED("Popup blocked by browser");
    } else if ((error as AuthError).code === "auth/operation-not-supported-in-this-environment") {
      throw new FireBaseErrors.OPERATION_NOT_SUPPORTED("Operation not supported in this environment");
    } else if ((error as AuthError).code === "auth/auth-event-not-found") {
      throw new FireBaseErrors.NO_AUTH_EVENT("Auth event not found");
    } else if((error as AuthError).code === "auth/rejected-credential") {
      throw new FireBaseErrors.REJECTED_CREDENTIAL("Rejected credential");
    } else if((error as AuthError).code === "auth/credential-already-in-use") {
      throw new FireBaseErrors.CREDENTIAL_ALREADY_IN_USE("Credential already in use");
    } else if((error as AuthError).code === "auth/user-not-found") {
      throw new FireBaseErrors.USER_DELETED("User deleted");
    } else if((error as AuthError).code === "auth/operation-not-allowed") {
      throw new FireBaseErrors.OPERATION_NOT_ALLOWED("Operation not allowed");
    } else if((error as AuthError).code === "auth/email-already-in-use"){
      throw new FireBaseErrors.EMAIL_EXISTS("Email already in use");
    } else if((error as AuthError).code === "auth/wrong-password"){
      throw new FireBaseErrors.INVALID_PASSWORD("Invalid password");
    } else if((error as AuthError).code === "auth/cancelled-popup-request"){
      throw new FireBaseErrors.EXPIRED_POPUP_REQUEST("Expired popup request");
    } else if((error as AuthError).code === "auth/invalid-credential"){
      throw new FireBaseErrors.INVALID_CRED("Invalid credentials");
    } else {
      throw new FireBaseErrors.INTERNAL_ERROR("Unknown error");
    }
  }
}

const signinWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const res = await saveUser2(user);
    const token = await user.getIdToken();
    const refreshToken = await user.refreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refresh_token', refreshToken);
    // Set refresh token as a cookie for backend access
    document.cookie = `refresh_token=${refreshToken}; path=/; secure; samesite=strict`;
    return res;
  } catch (error) {
    await sendError(error);
    if ((error as AuthError).code === "auth/popup-closed-by-user") {
      throw new FireBaseErrors.POPUP_CLOSED_BY_USER("Popup closed by user");
    } else if ((error as AuthError).code === "auth/popup-blocked") {
      throw new FireBaseErrors.POPUP_BLOCKED("Popup blocked by browser");
    } else if ((error as AuthError).code === "auth/operation-not-supported-in-this-environment") {
      throw new FireBaseErrors.OPERATION_NOT_SUPPORTED("Operation not supported in this environment");
    } else if ((error as AuthError).code === "auth/auth-event-not-found") {
      throw new FireBaseErrors.NO_AUTH_EVENT("Auth event not found");
    } else if((error as AuthError).code === "auth/rejected-credential") {
      throw new FireBaseErrors.REJECTED_CREDENTIAL("Rejected credential");
    } else if((error as AuthError).code === "auth/credential-already-in-use") {
      throw new FireBaseErrors.CREDENTIAL_ALREADY_IN_USE("Credential already in use");
    } else if((error as AuthError).code === "auth/user-not-found") {
      throw new FireBaseErrors.USER_DELETED("User deleted");
    } else if((error as AuthError).code === "auth/operation-not-allowed") {
      throw new FireBaseErrors.OPERATION_NOT_ALLOWED("Operation not allowed");
    } else if((error as AuthError).code === "auth/email-already-in-use"){
      throw new FireBaseErrors.EMAIL_EXISTS("Email already in use");
    } else if((error as AuthError).code === "auth/wrong-password"){
      throw new FireBaseErrors.INVALID_PASSWORD("Invalid password");
    } else if((error as AuthError).code === "auth/cancelled-popup-request"){
      throw new FireBaseErrors.EXPIRED_POPUP_REQUEST("Expired popup request");
    } else if((error as AuthError).code === "auth/invalid-credential"){
      throw new FireBaseErrors.INVALID_CRED("Invalid credentials");
    } else {
      throw new FireBaseErrors.INTERNAL_ERROR("Unknown error");
    }
  }
}

const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const res = await saveUser2(user, firstName, lastName);
    const token = await user.getIdToken();
    const refreshToken = await user.refreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refresh_token', refreshToken);
    // Set refresh token as a cookie for backend access
    document.cookie = `refresh_token=${refreshToken}; path=/; secure; samesite=strict`;
    return res;
  } catch (error) {
    await sendError(error);
    if ((error as AuthError).code === "auth/popup-closed-by-user") {
      throw new FireBaseErrors.POPUP_CLOSED_BY_USER("Popup closed by user");
    } else if ((error as AuthError).code === "auth/popup-blocked") {
      throw new FireBaseErrors.POPUP_BLOCKED("Popup blocked by browser");
    } else if ((error as AuthError).code === "auth/operation-not-supported-in-this-environment") {
      throw new FireBaseErrors.OPERATION_NOT_SUPPORTED("Operation not supported in this environment");
    } else if ((error as AuthError).code === "auth/auth-event-not-found") {
      throw new FireBaseErrors.NO_AUTH_EVENT("Auth event not found");
    } else if((error as AuthError).code === "auth/rejected-credential") {
      throw new FireBaseErrors.REJECTED_CREDENTIAL("Rejected credential");
    } else if((error as AuthError).code === "auth/credential-already-in-use") {
      throw new FireBaseErrors.CREDENTIAL_ALREADY_IN_USE("Credential already in use");
    } else if((error as AuthError).code === "auth/user-not-found") {
      throw new FireBaseErrors.USER_DELETED("User deleted");
    } else if((error as AuthError).code === "auth/operation-not-allowed") {
      throw new FireBaseErrors.OPERATION_NOT_ALLOWED("Operation not allowed");
    } else if((error as AuthError).code === "auth/email-already-in-use"){
      throw new FireBaseErrors.EMAIL_EXISTS("Email already in use");
    } else if((error as AuthError).code === "auth/wrong-password"){
      throw new FireBaseErrors.INVALID_PASSWORD("Invalid password");
    } else if((error as AuthError).code === "auth/cancelled-popup-request"){
      throw new FireBaseErrors.EXPIRED_POPUP_REQUEST("Expired popup request");
    } else if((error as AuthError).code === "auth/invalid-credential"){
      throw new FireBaseErrors.INVALID_CRED("Invalid credentials");
    } else {
      throw new FireBaseErrors.INTERNAL_ERROR("Unknown error");
    }
  }
}

export { signinWithGoogle, signinWithEmail, signUpWithEmail}