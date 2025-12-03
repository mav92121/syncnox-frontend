import apiClient from "@/config/apiClient.config";
import { Job } from "@/types/job.type";

export const fetchJobs = async (): Promise<Job[]> => {
  try {
    const response = await apiClient.get("/jobs");
    return response.data;
  } catch (error) {
    console.log("error -> ", error);
    return [];
  }
};

export const createJob = async (jobData: Job) => {
  try {
    const response = await apiClient.post("/jobs", jobData);
    console.log("response jobs -> ", response);
    return response.data;
  } catch (error) {
    console.log("error -> ", error);
    return null;
  }
};
