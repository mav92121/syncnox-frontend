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
    return result.data;
  } catch (err) {
    const error = err as LoginError;
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
    return {
      status: result.status,
      message: result.data?.message || "Logout successfull",
    };
  } catch (err) {
    const error = err as LoginError;
    if (error.status === 401 || error.status === 500) {
      return {
        status: error.status,
        message: error.response?.data?.detail || "Something went wrong",
      };
    }
  }
};
