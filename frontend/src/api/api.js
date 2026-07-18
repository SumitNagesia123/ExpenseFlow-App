import axios from "axios";
import { auth } from "../firebaseConfig";

const getApiUrl = () => {
  // 1. If running locally, always target the local backend port 5000
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:5000/api";
  }
  
  // 2. Otherwise, check environment variables (if they contain a production URL)
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;
  }
  
  // 3. Fallback to production Render backend URL
  return "https://expenseflow-backend.onrender.com/api";
};

export const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach JWT token or Firebase ID Token to every request
 */
api.interceptors.request.use(
  async (config) => {
    // 1. Try to get Firebase Token (if using Firebase Auth)
    if (auth && auth.currentUser) {
        try {
            const firebaseToken = await auth.currentUser.getIdToken();
            if (firebaseToken) {
                config.headers.Authorization = `Bearer ${firebaseToken}`;
                return config;
            }
        } catch (err) {
            console.error("Failed to get Firebase token", err);
        }
    }

    // 2. Fallback to Local JWT (if using custom auth or Firebase isn't ready)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Auto logout on 401 (expired / invalid token)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optional: auth.signOut() if using firebase
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
