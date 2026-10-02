// =========================================================
// MEDICORE — EMAIL VERIFICATION
// =========================================================

const verificationMessage =
    document.getElementById("verificationMessage");

const verificationEmail =
    document.getElementById("verificationEmail");

const verifyError =
    document.getElementById("verifyError");

const verifyErrorText =
    document.getElementById("verifyErrorText");

const verifySuccess =
    document.getElementById("verifySuccess");

const verifySuccessText =
    document.getElementById("verifySuccessText");

const resendVerification =
    document.getElementById("resendVerification");

const resendButtonText =
    document.getElementById("resendButtonText");

const resendSpinner =
    document.getElementById("resendSpinner");

const resendArrow =
    document.getElementById("resendArrow");

const resendCountdown =
    document.getElementById("resendCountdown");

const changeEmailLink =
    document.getElementById("changeEmailLink");

const currentYear =
    document.getElementById("currentYear");

const mobileYear =
    document.getElementById("mobileYear");


// =========================================================
// CONFIGURATION
// =========================================================

const RESEND_COOLDOWN_SECONDS = 60;

let resendTimer = null;


// =========================================================
// INITIALIZATION
// =========================================================

const currentYearValue = new Date().getFullYear();

if (currentYear) {
    currentYear.textContent = currentYearValue;
}

if (mobileYear) {
    mobileYear.textContent = currentYearValue;
}


// =========================================================
// HELPERS
// =========================================================

function getStoredEmail() {

    return (
        sessionStorage.getItem("medicore_registration_email") ||
        localStorage.getItem("medicore_registration_email") ||
        sessionStorage.getItem("medicore_reset_email") ||
        ""
    );
}


function getVerificationToken() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("token");
}


function showError(message) {

    if (verifyErrorText) {
        verifyErrorText.textContent = message;
    }

    verifyError.classList.remove("d-none");

    verifySuccess.classList.add("d-none");
}


function showSuccess(message) {

    if (verifySuccessText) {
        verifySuccessText.textContent = message;
    }

    verifySuccess.classList.remove("d-none");

    verifyError.classList.add("d-none");
}


function clearMessages() {

    verifyError.classList.add("d-none");

    verifySuccess.classList.add("d-none");

    if (verifyErrorText) {
        verifyErrorText.textContent = "";
    }

    if (verifySuccessText) {
        verifySuccessText.textContent = "";
    }
}


function maskEmail(email) {

    if (!email || !email.includes("@")) {
        return email || "your email address";
    }

    const [name, domain] =
        email.split("@");

    if (name.length <= 2) {
        return `${name.charAt(0)}***@${domain}`;
    }

    return (
        `${name.charAt(0)}` +
        `${"*".repeat(Math.min(name.length - 2, 5))}` +
        `${name.charAt(name.length - 1)}` +
        `@${domain}`
    );
}


function updateEmailDisplay() {

    const email = getStoredEmail();

    if (verificationEmail) {
        verificationEmail.textContent =
            email
                ? maskEmail(email)
                : "your email address";
    }

    if (verificationMessage && email) {

        verificationMessage.textContent =
            `We've sent a verification link to ${maskEmail(email)}.`;
    }
}


// =========================================================
// LOADING STATE
// =========================================================

function setResendLoading(isLoading) {

    resendVerification.disabled =
        isLoading;

    if (isLoading) {

        resendButtonText.textContent =
            "Sending...";

        resendSpinner.classList.remove(
            "d-none"
        );

        resendArrow.classList.add(
            "d-none"
        );

    } else {

        resendButtonText.textContent =
            "Resend verification email";

        resendSpinner.classList.add(
            "d-none"
        );

        resendArrow.classList.remove(
            "d-none"
        );
    }
}


// =========================================================
// COUNTDOWN
// =========================================================

function stopCountdown() {

    if (resendTimer) {

        clearInterval(
            resendTimer
        );

        resendTimer = null;
    }
}


function startCountdown(
    seconds = RESEND_COOLDOWN_SECONDS
) {

    stopCountdown();

    let remaining = seconds;

    resendVerification.disabled = true;

    updateCountdownText(remaining);

    resendTimer = setInterval(() => {

        remaining -= 1;

        if (remaining <= 0) {

            stopCountdown();

            resendVerification.disabled = false;

            resendCountdown.textContent =
                "You can request another verification email.";

            return;
        }

        updateCountdownText(remaining);

    }, 1000);
}


function updateCountdownText(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        seconds % 60;

    const formattedSeconds =
        String(remainingSeconds).padStart(2, "0");

    resendCountdown.textContent =
        `You can resend again in ${minutes}:${formattedSeconds}.`;
}


// =========================================================
// VERIFY EMAIL FROM TOKEN
// =========================================================

async function verifyEmailFromToken() {

    const token =
        getVerificationToken();

    if (!token) {
        return;
    }

    clearMessages();

    try {

        const response =
            await window.mediCoreAPI.post(
                "/auth/verify-email",
                {
                    token
                }
            );

        if (!response.data?.success) {

            throw new Error(
                response.data?.message ||
                "Email verification failed."
            );
        }

        showSuccess(
            "Your email has been verified successfully. Redirecting you to sign in..."
        );

        sessionStorage.removeItem(
            "medicore_registration_email"
        );

        localStorage.removeItem(
            "medicore_registration_email"
        );

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 2000);

    } catch (error) {

        console.error(
            "Email verification error:",
            error
        );

        const message =
            error.response?.data?.message;

        if (error.response?.status === 400) {

            showError(
                message ||
                "This verification link is invalid or has expired."
            );

        } else if (!error.response) {

            showError(
                "Unable to connect to the MediCore server. Please make sure the backend is running."
            );

        } else {

            showError(
                message ||
                "We could not verify your email address."
            );
        }
    }
}


// =========================================================
// RESEND VERIFICATION
// =========================================================

async function resendVerificationEmail() {

    clearMessages();

    const email =
        getStoredEmail();

    if (!email) {

        showError(
            "We could not find the email address for this verification request. Please register again."
        );

        return;
    }

    setResendLoading(true);

    try {

        const response =
            await window.mediCoreAPI.post(
                "/auth/resend-verification",
                {
                    email
                }
            );

        if (!response.data?.success) {

            throw new Error(
                response.data?.message ||
                "Unable to resend verification email."
            );
        }


        /*
         * Development mode:
         * The backend may return the raw verification
         * token while email delivery is not configured.
         */

        if (response.data?.data?.verificationToken) {

            sessionStorage.setItem(
                "medicore_verification_token",
                response.data.data.verificationToken
            );
        }


        showSuccess(
            "A new verification email has been requested. Please check your inbox."
        );

        startCountdown();

    } catch (error) {

        console.error(
            "Resend verification error:",
            error
        );

        const status =
            error.response?.status;

        const message =
            error.response?.data?.message;


        if (status === 400) {

            showError(
                message ||
                "Unable to resend the verification email."
            );

        } else if (status === 404) {

            showError(
                "No account was found for this email address."
            );

        } else if (!error.response) {

            showError(
                "Unable to connect to the MediCore server. Please make sure the backend is running."
            );

        } else {

            showError(
                message ||
                "Something went wrong while requesting the verification email."
            );
        }

    } finally {

        setResendLoading(false);
    }
}


// =========================================================
// EVENTS
// =========================================================

resendVerification.addEventListener(
    "click",
    resendVerificationEmail
);


if (changeEmailLink) {

    changeEmailLink.addEventListener(
        "click",
        () => {

            /*
             * Keep the user registration email available
             * until the registration page is intentionally
             * restarted.
             */
        }
    );
}


// =========================================================
// INITIALIZE
// =========================================================

updateEmailDisplay();

verifyEmailFromToken();