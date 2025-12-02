import apiClient from "@/lib/apiClient";

interface LoginError {
  status: number;
  response: {
    data: {
      detail: string;
    };
  };
}

export const login = async (email: string, password: string) => {
  try {
    const result = await apiClient.post("/auth/login", { email, password });
    console.log("login success -> ", result);
    // Backend sets HTTP-only cookie automatically
    // Return user data from response
    return result.data;
  } catch (err) {
    const error = err as LoginError;
    console.log("login error -> ", error);
    if (error.status === 401 || error.status === 500) {
      return {
        status: error.status,
        message: error.response?.data?.detail || "Something went wrong",
      };
    }
  }
};

export const logout = async () => {
  try {
    const result = await apiClient.post("/auth/logout");
    console.log("logout success -> ", result);
    // Backend sets HTTP-only cookie automatically
    // Return user data from response
    return result.data;
  } catch (err) {
    const error = err as LoginError;
    console.log("logout error -> ", error);
    if (error.status === 401 || error.status === 500) {
      return {
        status: error.status,
        message: error.response?.data?.detail || "Something went wrong",
      };
    }
  }
};