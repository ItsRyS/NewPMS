import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const tabId = sessionStorage.getItem("tabId");
  if (tabId) {
    config.headers["x-tab-id"] = tabId;
  }
  return config;
});

export default api;
