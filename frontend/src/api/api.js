import axios from "axios";
import { auth } from "../firebaseConfig";

// Fallback URL (the user can override this using VITE_API_URL env var during build/hosting deployment)
const FALLBACK_API = "https://expenseflow-backend.onrender.com";

const backendUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || FALLBACK_API;
export const API_URL = backendUrl.endsWith("/api") ? backendUrl : `${backendUrl}/api`;

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
