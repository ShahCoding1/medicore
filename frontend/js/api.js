const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Attach JWT automatically to authenticated requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("medicore_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle authentication errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("medicore_token");
            localStorage.removeItem("medicore_user");
        }

        return Promise.reject(error);
    }
);

window.mediCoreAPI = api;