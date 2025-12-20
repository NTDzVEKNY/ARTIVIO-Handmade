import { fetchApi } from "./api";

// Define interfaces for request and response types based on typical authentication flows
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string; // Assuming the backend returns a JWT or similar token
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  // Add any other user details returned by the backend upon login/registration
}

// Function to handle user login
export const login = async (credentials: LoginPayload): Promise<AuthResponse> => {
  return fetchApi<AuthResponse>("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
};

// Function to handle user registration
export const register = async (userData: RegisterPayload): Promise<AuthResponse> => {
  return fetchApi<AuthResponse>("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
};

// Function to check if an email already exists
export const checkEmailExists = async (email: string): Promise<{ exists: boolean }> => {
  return fetchApi<{ exists: boolean }>(`/check-email?email=${encodeURIComponent(email)}`);
};

// Function to check if a username already exists
export const checkUsernameExists = async (username: string): Promise<{ exists: boolean }> => {
  return fetchApi<{ exists: boolean }>(`/check-username?username=${encodeURIComponent(username)}`);
};

// Function to request password reset
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  return fetchApi<{ message: string }>("/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
};