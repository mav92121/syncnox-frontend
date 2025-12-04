import axios from "axios";
import { getSession } from "next-auth/react";

const env = process.env.NEXT_PUBLIC_ENVIRONMENT;
const server = process.env.NEXT_PUBLIC_SERVER_URL ?? "";

const isLocal = env === "development";
const isLocalBackend = server.includes("localhost");

// If local FE + local BE → use proxy (/api)
const useProxy = isLocal && isLocalBackend;

const apiClient = axios.create({
  baseURL: useProxy ? "/api" : `${server}/api`,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  async (config) => {
    // Get NextAuth session and add token to Authorization header
    const session = await getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API Error:", error.response?.data || error.message);

    // Redirect to sign-in on 401 Unauthorized
    if (error.response?.status === 401) {
      window.location.href = "/sign-in";
    }

    return Promise.reject(error);
  }
);

export default apiClient;
