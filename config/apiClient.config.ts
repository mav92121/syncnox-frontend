import axios from "axios";

const env = process.env.NEXT_PUBLIC_ENVIRONMENT;
const server = process.env.NEXT_PUBLIC_SERVER_URL ?? "";

const isLocal = env === "development";
const isLocalBackend = server.includes("localhost");

// If local FE + local BE → use proxy (/api)
const useProxy = isLocal && isLocalBackend;

const apiClient = axios.create({
  baseURL: useProxy ? "/api" : `${server}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
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
    return Promise.reject(error);
  }
);

export default apiClient;
