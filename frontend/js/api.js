const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});


// =========================================================
// GET STORED AUTH TOKEN
// =========================================================

function getAuthToken() {

    return (
        localStorage.getItem("medicore_token") ||
        sessionStorage.getItem("medicore_token")
    );

}


// =========================================================
// ATTACH JWT TO REQUESTS
// =========================================================

api.interceptors.request.use(
    (config) => {

        const token = getAuthToken();

        if (token) {

            config.headers = config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;

    },
    (error) => Promise.reject(error)
);


// =========================================================
// GLOBAL AUTH ERROR HANDLING
// =========================================================

api.interceptors.response.use(
    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            console.warn(
                "MediCore API authentication failed:",
                error.config?.url
            );

            /*
             * Do not immediately delete the token here.
             *
             * Individual pages can decide how to handle
             * an expired/invalid session.
             */

        }

        return Promise.reject(error);

    }
);


window.mediCoreAPI = api;