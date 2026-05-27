import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";  // ← 추가

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 — 쿠키 대신 Zustand 스토어에서 직접 읽기
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;  // ← 변경
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 — 401 시 refresh 후 재시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
        const newToken = res.data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);  // ← 변경 (스토어+쿠키 동시 업데이트)
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;