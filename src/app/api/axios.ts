import axios from "axios";
import { toast } from "sonner";
import { API_BASE } from "@/app/constants";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error;

    if (status === 401) {
      toast.error("Not authenticated. Please sign in.");
    } else if (status === 404) {
      toast.error(message || "Resource not found.");
    } else if (status && status >= 500) {
      toast.error(message || "Something went wrong. Please try again.");
    } else if (!error.response) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
