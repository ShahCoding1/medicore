/* =========================================================
   MEDICORE FORGOT PASSWORD
   ========================================================= */


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const forgotForm =
    document.getElementById("forgotPasswordForm");

const forgotEmail =
    document.getElementById("forgotEmail");

const forgotEmailError =
    document.getElementById("forgotEmailError");

const forgotButton =
    document.getElementById("forgotButton");

const forgotButtonText =
    document.getElementById("forgotButtonText");

const forgotSpinner =
    document.getElementById("forgotSpinner");

const forgotArrow =
    document.getElementById("forgotArrow");

const forgotError =
    document.getElementById("forgotError");

const forgotErrorText =
    document.getElementById("forgotErrorText");

const forgotSuccess =
    document.getElementById("forgotSuccess");

const forgotSuccessText =
    document.getElementById("forgotSuccessText");

const currentYear =
    document.getElementById("currentYear");

const mobileYear =
    document.getElementById("mobileYear");


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeForgotPassword
);


function initializeForgotPassword() {

    const year =
        new Date().getFullYear();

    if (currentYear) {
        currentYear.textContent = year;
    }

    if (mobileYear) {
        mobileYear.textContent = year;
    }


    bindEvents();


    /*
     * If the user previously entered an email
     * during registration/login, use it here.
     */

    const savedEmail =
        sessionStorage.getItem(
            "medicore_registration_email"
        );

    if (savedEmail && forgotEmail) {

        forgotEmail.value =
            savedEmail;

    }

}


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents() {

    forgotForm?.addEventListener(
        "submit",
        handleForgotPassword
    );


    forgotEmail?.addEventListener(
        "input",
        () => {

            clearFieldError();

            clearMessages();

        }
    );

}


/* =========================================================
   SUBMIT
   ========================================================= */

async function handleForgotPassword(event) {

    event.preventDefault();

    clearMessages();


    const email =
        forgotEmail.value.trim().toLowerCase();


    if (!validateEmail(email)) {
        return;
    }


    setLoadingState(true);


    try {

        const response =
            await window.mediCoreAPI.post(
                "/auth/forgot-password",
                {
                    email
                }
            );


        const data =
            response.data;


        /*
         * The backend intentionally returns a generic
         * response so we don't reveal whether an
         * account exists.
         */

        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to process your request."
            );

        }


        /*
         * Keep the email for the reset-password page.
         */

        sessionStorage.setItem(
            "medicore_reset_email",
            email
        );


        showSuccess(
            data.message ||
            "If an account exists for this email, password reset instructions have been sent."
        );


        /*
         * In development the backend may return
         * a reset token. We preserve it for local
         * development/testing only.
         */

        if (data.resetToken) {

            sessionStorage.setItem(
                "medicore_reset_token",
                data.resetToken
            );

        }


    } catch (error) {

        console.error(
            "MediCore forgot password error:",
            error
        );


        handleError(error);

    } finally {

        setLoadingState(false);

    }

}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateEmail(email) {

    if (!email) {

        showFieldError(
            "Email address is required."
        );

        return false;

    }


    if (!isValidEmail(email)) {

        showFieldError(
            "Please enter a valid email address."
        );

        return false;

    }


    clearFieldError();

    return true;

}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );

}


/* =========================================================
   FIELD ERROR
   ========================================================= */

function showFieldError(message) {

    forgotEmailError.textContent =
        message;


    forgotEmail
        .closest(".input-wrapper")
        ?.classList.add("input-error");

}


function clearFieldError() {

    forgotEmailError.textContent = "";


    forgotEmail
        .closest(".input-wrapper")
        ?.classList.remove("input-error");

}


/* =========================================================
   ERROR HANDLING
   ========================================================= */

function handleError(error) {

    const status =
        error.response?.status;


    const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to process your request.";


    /*
     * Validation error from API.
     */

    if (status === 400 || status === 422) {

        showError(message);

        return;
    }


    /*
     * Backend unavailable.
     */

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
   MESSAGES
   ========================================================= */

function showError(message) {

    forgotErrorText.textContent =
        message;

    forgotError.classList.remove(
        "d-none"
    );

    forgotSuccess.classList.add(
        "d-none"
    );

}


function showSuccess(message) {

    forgotSuccessText.textContent =
        message;

    forgotSuccess.classList.remove(
        "d-none"
    );

    forgotError.classList.add(
        "d-none"
    );

}


function clearMessages() {

    forgotError.classList.add(
        "d-none"
    );

    forgotSuccess.classList.add(
        "d-none"
    );

    forgotErrorText.textContent = "";

    forgotSuccessText.textContent = "";

}


/* =========================================================
   LOADING STATE
   ========================================================= */

function setLoadingState(isLoading) {

    forgotButton.disabled =
        isLoading;


    if (isLoading) {

        forgotButtonText.classList.add(
            "d-none"
        );

        forgotArrow.classList.add(
            "d-none"
        );

        forgotSpinner.classList.remove(
            "d-none"
        );

    } else {

        forgotButtonText.classList.remove(
            "d-none"
        );

        forgotArrow.classList.remove(
            "d-none"
        );

        forgotSpinner.classList.add(
            "d-none"
        );

    }

}


/* =========================================================
   DEBUG ACCESS
   ========================================================= */

window.mediCoreForgotPassword = {

    validateEmail,

    showError,

    showSuccess,

    clearMessages

};