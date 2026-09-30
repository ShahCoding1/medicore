/* =========================================================
   MEDICORE LOGIN
   ========================================================= */

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMe = document.getElementById("rememberMe");

const togglePassword = document.getElementById("togglePassword");

const loginButton = document.getElementById("loginButton");
const loginButtonText = document.getElementById("loginButtonText");
const loginSpinner = document.getElementById("loginSpinner");
const loginArrow = document.getElementById("loginArrow");

const loginError = document.getElementById("loginError");
const loginErrorText = document.getElementById("loginErrorText");

const loginSuccess = document.getElementById("loginSuccess");
const loginSuccessText = document.getElementById("loginSuccessText");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const currentYear = document.getElementById("currentYear");


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeLogin();

});


function initializeLogin() {

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    loadRememberedEmail();

    bindEvents();

}


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents() {

    loginForm?.addEventListener("submit", handleLogin);

    togglePassword?.addEventListener(
        "click",
        handlePasswordToggle
    );

    emailInput?.addEventListener(
        "input",
        () => clearFieldError(emailInput, emailError)
    );

    passwordInput?.addEventListener(
        "input",
        () => clearFieldError(passwordInput, passwordError)
    );

}


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

function handlePasswordToggle() {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    togglePassword.innerHTML = isPassword
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';

    togglePassword.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
    );

}


/* =========================================================
   LOGIN
   ========================================================= */

async function handleLogin(event) {

    event.preventDefault();

    clearMessages();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    const isValid = validateLogin(
        email,
        password
    );

    if (!isValid) {
        return;
    }

    setLoadingState(true);

    try {

        const response = await window.mediCoreAPI.post(
            "/auth/login",
            {
                email,
                password
            }
        );

        const data = response.data;

        if (!data.success) {
            throw new Error(
                data.message || "Unable to sign in."
            );
        }

        /*
         * Store authentication data.
         */

        localStorage.setItem(
            "medicore_token",
            data.token
        );

        localStorage.setItem(
            "medicore_user",
            JSON.stringify(data.user)
        );


        /*
         * Remember email only.
         * Never store the password.
         */

        if (rememberMe.checked) {

            localStorage.setItem(
                "medicore_remember_email",
                email
            );

        } else {

            localStorage.removeItem(
                "medicore_remember_email"
            );

        }


        showSuccess(
            "Sign in successful. Opening your workspace..."
        );


        /*
         * Small delay so the user can see
         * the successful authentication state.
         */

        setTimeout(() => {

            window.location.href =
                "pages/dashboard.html";

        }, 700);


    } catch (error) {

        console.error(
            "MediCore login error:",
            error
        );

        handleLoginError(error);

    } finally {

        setLoadingState(false);

    }

}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateLogin(email, password) {

    let valid = true;


    if (!email) {

        showFieldError(
            emailInput,
            emailError,
            "Email address is required."
        );

        valid = false;

    } else if (!isValidEmail(email)) {

        showFieldError(
            emailInput,
            emailError,
            "Please enter a valid email address."
        );

        valid = false;

    }


    if (!password) {

        showFieldError(
            passwordInput,
            passwordError,
            "Password is required."
        );

        valid = false;

    } else if (password.length < 8) {

        showFieldError(
            passwordInput,
            passwordError,
            "Password must contain at least 8 characters."
        );

        valid = false;

    }


    return valid;

}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


/* =========================================================
   FIELD ERRORS
   ========================================================= */

function showFieldError(
    input,
    errorElement,
    message
) {

    input.closest(".input-wrapper")
        ?.classList.add("input-error");

    errorElement.textContent = message;

}


function clearFieldError(
    input,
    errorElement
) {

    input.closest(".input-wrapper")
        ?.classList.remove("input-error");

    errorElement.textContent = "";

}


/* =========================================================
   API ERROR HANDLING
   ========================================================= */

function handleLoginError(error) {

    const status = error.response?.status;

    const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to sign in. Please try again.";


    if (status === 401) {

        showError(
            "Invalid email or password. Please check your credentials and try again."
        );

        return;
    }


    if (status === 403) {

        showError(message);

        return;
    }


    if (
        error.code === "ERR_NETWORK" ||
        !error.response
    ) {

        showError(
            "Unable to connect to MediCore. Please make sure the backend server is running."
        );

        return;
    }


    showError(message);

}


/* =========================================================
   UI MESSAGES
   ========================================================= */

function showError(message) {

    loginErrorText.textContent = message;

    loginError.classList.remove("d-none");

    loginSuccess.classList.add("d-none");

}


function showSuccess(message) {

    loginSuccessText.textContent = message;

    loginSuccess.classList.remove("d-none");

    loginError.classList.add("d-none");

}


function clearMessages() {

    loginError.classList.add("d-none");
    loginSuccess.classList.add("d-none");

    loginErrorText.textContent = "";
    loginSuccessText.textContent = "";

}


/* =========================================================
   LOADING STATE
   ========================================================= */

function setLoadingState(isLoading) {

    loginButton.disabled = isLoading;

    if (isLoading) {

        loginButtonText.classList.add("d-none");

        loginArrow.classList.add("d-none");

        loginSpinner.classList.remove("d-none");

    } else {

        loginButtonText.classList.remove("d-none");

        loginArrow.classList.remove("d-none");

        loginSpinner.classList.add("d-none");

    }

}


/* =========================================================
   REMEMBERED EMAIL
   ========================================================= */

function loadRememberedEmail() {

    const savedEmail =
        localStorage.getItem(
            "medicore_remember_email"
        );

    if (!savedEmail) {
        return;
    }

    emailInput.value = savedEmail;

    rememberMe.checked = true;

}


/* =========================================================
   GLOBAL DEBUG ACCESS
   ========================================================= */

window.mediCoreLogin = {

    validateLogin,

    clearMessages,

    showError,

    showSuccess

};