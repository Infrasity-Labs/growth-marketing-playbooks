import { OutlineType } from "@/domain/outline";
import axios from "axios";
import { AxiosError } from "axios";
import { exampleOutlineOne } from "@/static-content/exampleOutlines";


type ErrorResponse = {
  error: string;
};

function handleHttpError(statusCode: number, errorMessage: string) {
  switch (statusCode) {
    case 400:
      throw new Error("The server could not understand the request.");
    case 401:
      throw new Error("You need to be authenticated to access this resource.");
    case 403:
      throw new Error("You don't have permission to access this resource.");
    case 404:
      throw new Error("The requested resource was not found.");
    case 409:
      throw new Error("There was a conflict while processing your request.");
    case 422:
      throw new Error(
        "Server could not process your request. Please try again."
      );
    case 429:
      throw new Error(
        "You exceeded your current quota, please check your plan and billing details."
      );
    case 503:
      throw new Error(
        "The engine is currently overloaded, please try again later."
      );
    case 500:
      throw new Error("The server had an error while processing your request.");
    default:
      throw new Error("An unknown error occurred.");
  }
}

const getOutline = async ({
  topic,
  model,
  difficulty,
  client,
  additionalInfo,
  workPosition,
  interests,
  targetAudience,
  userId,
  token
}: {
  topic: string,
  model: string,
  difficulty: string,
  client: string,
  additionalInfo: string,
  workPosition: string,
  interests: string[],
  targetAudience: (string | number | symbol | null)[],
  userId: string,
  token: string | undefined
}) => {
  try {
    const response = await axios.post(
      "/outline-gen/api/generate/",
      {
        topic,
        model,
        difficulty,
        client,
        additionalInfo,
        workPosition,
        interests,
        targetAudience,
        userId 
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      }
    );
    if (response.data.data === "No valid JSON found")
      throw new Error("Error fetching outline");
    console.log("data from deployed", response)
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError && axiosError.response) {
        handleHttpError(
          axiosError.response.status,
          axiosError.response.data.error
        );
      } else {
        console.error("Error without response:", error.message);
      }
    } else {
      console.error("Non-Axios error:", error);
    }
  }
};

const refineSections = async (
  sections: string[],
  topic: string,
  difficulty: string,
  client: string,
  additionalInfo: string,
  userWorkPosition: string,
  userInterests: string[],
  targetAudience: (string | number | symbol | null)[],
  token: string | undefined
) => {
  try {
    const response = await axios.post(
      "/outline-gen/api/refine/",
      {
        sections: sections,
        topic,
        difficulty,
        client,
        additionalInfo,
        userWorkPosition,
        userInterests,
        targetAudience: targetAudience
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.data === "No valid JSON found")
      throw new Error("Error refining sections");
    return response.data.data;
    // return exampleOutlineOne;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError && axiosError.response) {
        handleHttpError(
          axiosError.response.status,
          axiosError.response.data.error
        );
      } else {
        console.error("Error without response:", error.message);
      }
    } else {
      console.error("Non-Axios error:", error);
    }
  }
};

// Replace cookie-based token functions with localStorage equivalents

const setIdToken = (token: string) => {
  localStorage.setItem('token', token);
};

const getIdToken = () => {
  return localStorage.getItem('token');
};

const setRefreshToken = (token: string) => {
  localStorage.setItem('refresh_token', token);
};

const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
};

const sendError = async (error: unknown) => {
  try {
    await axios.post("/outline-gen/api/log-error/", { errors: error });
  } catch (error) {
    throw new Error("Error sending errors");
  }
};

const exportOutlineToDocx = async (
  outline: OutlineType,
  token: string | undefined
) => {
  try {
    const response = await axios.post(
      "/outline-gen/api/export-docx/", // <-- trailing slash!
      { data: outline },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "arraybuffer", // Important for binary files!
      }
    );
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    return blob;
  } catch (error) {
    throw new Error("Error exporting outline to docx");
  }
};

export {
  getOutline,
  refineSections,
  setIdToken as setIdTokenCookie,
  sendError,
  exportOutlineToDocx,
  setRefreshToken as setRefreshTokenInCookie,
  getIdToken as getIdTokenCookie,
  getRefreshToken as getRefreshTokenCookie,
  clearTokens as clearCookies
};
