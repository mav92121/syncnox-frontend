import axios from "axios";

// In development: use proxy to avoid cross-site cookie issues
// In production: call API directly (same-site since app.syncnox.com and api.syncnox.com share the same domain)
const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_ENVIRONMENT === "development"
      ? "/api" // Use Next.js proxy in dev
      : `${process.env.NEXT_PUBLIC_SERVER_URL}/api`, // Direct API call in production
  headers: {
    "Content-Type": "application/json",
  },
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
