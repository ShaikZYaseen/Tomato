import axios from "axios";

// This is the shape of the login/signup response data
export interface LoginDetails {
  username: string;
  password: string;
  url?: string; // Optional
  email: string;
}

// Define a response type for signup that includes success status and optional data or error message
export interface SignupResponse {
  success: boolean;
  data?: LoginDetails;
  message?: string;
}

// LOGIN service (unchanged, still throws error on failure)
export const loginService = async (loginPayload: {
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<LoginDetails> => {
  try {
    const url = `http://localhost:8080/api/v1/auth/signin`;
    const response = await axios.post<LoginDetails>(url, loginPayload);
    return response.data;
  } catch (error: any) {
    console.error("Failed to login:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || // <-- reads "User already exists" if your backend sends it
        error.message ||
        "Internal server error"
    };
  }
};

// SIGNUP service (returns success/failure wrapped response)
export const signupService = async (
  signupPayload: {
    username: string;
    email: string;
    password: string;
  }
): Promise<SignupResponse> => {
  try {
    const url = `http://localhost:8080/api/v1/auth/signup`;
    const response = await axios.post<LoginDetails>(url, signupPayload);

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error("Failed to signup:", error);

    return {
      success: false,
      message:
        error.response?.data?.message || // <-- reads "User already exists" if your backend sends it
        error.message ||
        "Internal server error"
    };
  }
};
