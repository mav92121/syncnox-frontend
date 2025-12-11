import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const env = process.env.NEXT_PUBLIC_ENVIRONMENT;
const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;

// Determine baseURL
let baseURL = `${backendUrl}/api`;

// Local dev: FE+BE both on localhost → use proxy:3000/api-proxy → 8000
if (env === "development" && backendUrl?.includes("localhost")) {
  baseURL = "/api-proxy";
}

const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Flag to prevent multiple 401 handlers running simultaneously
let isHandling401 = false;

apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("API Error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      // Prevent multiple handlers running at once
      if (isHandling401) {
        console.log("🔒 Already handling 401, skipping duplicate");
        return Promise.reject(error);
      }

      isHandling401 = true;

      // Token expired - clear stores and sign out from NextAuth
      try {
        console.log("🔒 Token expired - clearing stores and signing out");

        // Clear zustand stores
        const { useIndexStore } = await import("@/zustand/index.store");
        const { useJobsStore } = await import("@/zustand/jobs.store");

        useIndexStore.getState().clearUser();
        useJobsStore.getState().clearJobs();

        // Sign out from NextAuth (clears session cookie and redirects)
        if (typeof window !== "undefined") {
          await signOut({ callbackUrl: "/sign-in", redirect: true });
        }
      } catch (err) {
        console.error("Error during 401 handling:", err);
        // Fallback: manual redirect
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
      }
    }

    return Promise.reject(error.response?.data);
  }
);

export default apiClient;
