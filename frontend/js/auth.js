// ==========================================
// MEDICORE AUTHENTICATION
// ==========================================

const AUTH_TOKEN_KEY = "medicore_token";
const AUTH_USER_KEY = "medicore_user";


// ==========================================
// SAVE SESSION
// ==========================================

function saveAuthSession(token, user) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(user)
    );
}


// ==========================================
// GET TOKEN
// ==========================================

function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}


// ==========================================
// GET CURRENT USER
// ==========================================

function getCurrentUser() {
    const user = localStorage.getItem(AUTH_USER_KEY);

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}


// ==========================================
// CHECK AUTHENTICATION
// ==========================================

function isAuthenticated() {
    return Boolean(getAuthToken());
}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);

    // Return to the frontend root login page.
    window.location.href =
        window.location.pathname.includes("/pages/")
            ? "../login.html"
            : "login.html";
}


// ==========================================
// REQUIRE AUTHENTICATION
// ==========================================

function requireAuth() {

    if (!isAuthenticated()) {

        window.location.href =
            window.location.pathname.includes("/pages/")
                ? "../login.html"
                : "login.html";

        return false;
    }

    return true;
}


// ==========================================
// REDIRECT AUTHENTICATED USERS
// ==========================================

function redirectIfAuthenticated() {

    if (isAuthenticated()) {

        window.location.href =
            window.location.pathname.includes("/pages/")
                ? "dashboard.html"
                : "pages/dashboard.html";
    }
}


// ==========================================
// LOGIN
// ==========================================

async function loginUser(email, password) {

    try {

        const response =
            await window.mediCoreAPI.post(
                "/auth/login",
                {
                    email: email.trim().toLowerCase(),
                    password
                }
            );

        if (response.data?.success) {

            const {
                token,
                user
            } = response.data.data;

            saveAuthSession(token, user);

            return {
                success: true,
                user
            };
        }

        return {
            success: false,
            message:
                response.data?.message ||
                "Login failed."
        };

    } catch (error) {

        return {
            success: false,
            message:
                error.response?.data?.message ||
                "Unable to connect to the server. Please try again."
        };
    }
}


// ==========================================
// REGISTER
// ==========================================

async function registerUser(userData) {

    try {

        const response =
            await window.mediCoreAPI.post(
                "/auth/register",
                userData
            );

        if (response.data?.success) {

            const {
                token,
                user
            } = response.data.data;

            saveAuthSession(token, user);

            return {
                success: true,
                user
            };
        }

        return {
            success: false,
            message:
                response.data?.message ||
                "Registration failed."
        };

    } catch (error) {

        return {
            success: false,
            message:
                error.response?.data?.message ||
                "Unable to connect to the server. Please try again."
        };
    }
}


// ==========================================
// GLOBAL API
// ==========================================

window.mediCoreAuth = {

    saveAuthSession,

    getAuthToken,

    getCurrentUser,

    isAuthenticated,

    logout,

    requireAuth,

    redirectIfAuthenticated,

    loginUser,

    registerUser
};