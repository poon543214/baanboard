import axios from "axios";
import Configs from "../config";

const client = axios.create({
  baseURL: Configs.api.baseApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(Configs.storage.token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/login") ||
      requestUrl.includes("/register") ||
      requestUrl.includes("/forgot-password") ||
      requestUrl.includes("/reset-password");

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem(Configs.storage.user);
      localStorage.removeItem(Configs.storage.token);
      localStorage.setItem("auth_logout_reason", "session_expired");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default client;