import axios from "axios";
import { auth } from "../firebaseConfig";

// Production Railway URL is the ultimate fallback — works on ALL devices
const PROD_API = "https://expenseflow-app-production.up.railway.app/api";

const backendUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
const API_URL = backendUrl
  ? `${backendUrl}/api`
  : PROD_API;

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
