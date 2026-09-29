import axios from "axios";

export const AUTH_LOGOUT_EVENT = "auth:logout";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Expired or invalid token on any request -> log out everywhere
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && localStorage.getItem("token")) {
            window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
        }

        return Promise.reject(error);
    }
);

// Use the backend's message when there is one
export const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || fallback || error.message;

export default api;
