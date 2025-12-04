import axios from "axios";
import { getSession } from "next-auth/react";

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
  (error) => {
    console.log("API Error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      window.location.href = "/sign-in";
    }

    return Promise.reject(error);
  }
);

export default apiClient;
