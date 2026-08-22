import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Try to get token from localStorage directly
    let token = localStorage.getItem("token");
    
    // Fallback to getting it from Zustand persisted state if manual token is missing
    if (!token) {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed.state.token;
        } catch {
          // ignore parsing error
        }
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/signin') || error.config?.url?.includes('/auth/signup');
      if (!isAuthRoute && typeof window !== "undefined") {
        // Import store lazily to avoid circular dependencies if any
        import("@/store/useAuthStore").then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
          window.location.href = "/login";
        });
      }
    }
    return Promise.reject(error);
  }
);
