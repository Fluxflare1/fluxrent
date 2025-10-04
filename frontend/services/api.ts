import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, { refresh });
        localStorage.setItem("access_token", data.access);
        error.config.headers.Authorization = `Bearer ${data.access}`;
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
