// =========================================================
// MEDICORE — RESET PASSWORD
// =========================================================

const resetForm = document.getElementById("resetPasswordForm");

const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmNewPassword");

const toggleNewPassword = document.getElementById("toggleNewPassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

const resetButton = document.getElementById("resetButton");
const resetButtonText = document.getElementById("resetButtonText");
const resetSpinner = document.getElementById("resetSpinner");
const resetArrow = document.getElementById("resetArrow");

const resetError = document.getElementById("resetError");
const resetErrorText = document.getElementById("resetErrorText");

const resetSuccess = document.getElementById("resetSuccess");
const resetSuccessText = document.getElementById("resetSuccessText");

const newPasswordError = document.getElementById("newPasswordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

const resetStrengthLabel = document.getElementById("resetStrengthLabel");
const resetStrengthHint = document.getElementById("resetStrengthHint");

const strengthBars = document.querySelectorAll(".strength-bar");

const requirementLength =
    document.getElementById("requirementLength");

const requirementUppercase =
    document.getElementById("requirementUppercase");

const requirementLowercase =
    document.getElementById("requirementLowercase");

const requirementNumber =
    document.getElementById("requirementNumber");

const requirementSpecial =
    document.getElementById("requirementSpecial");

const currentYear = document.getElementById("currentYear");
const mobileYear = document.getElementById("mobileYear");


// =========================================================
// INITIALIZATION
// =========================================================

const year = new Date().getFullYear();

if (currentYear) {
    currentYear.textContent = year;
}

if (mobileYear) {
    mobileYear.textContent = year;
}


// =========================================================
// PASSWORD VISIBILITY
// =========================================================

function setupPasswordToggle(button, input) {

    if (!button || !input) return;

    button.addEventListener("click", () => {

        const isPassword = input.type === "password";

        input.type = isPassword ? "text" : "password";

        const icon = button.querySelector("i");

        if (icon) {
            icon.className = isPassword
                ? "bi bi-eye-slash"
                : "bi bi-eye";
        }

        button.setAttribute(
            "aria-label",
            isPassword ? "Hide password" : "Show password"
        );
    });
}


setupPasswordToggle(
    toggleNewPassword,
    newPasswordInput
);

setupPasswordToggle(
    toggleConfirmPassword,
    confirmPasswordInput
);


// =========================================================
// PASSWORD VALIDATION
// =========================================================

function getPasswordRules(password) {

    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
}


function getPasswordStrength(password) {

    const rules = getPasswordRules(password);

    const score = Object.values(rules)
        .filter(Boolean)
        .length;

    if (!password) {
        return {
            score: 0,
            label: "Password strength",
            hint: "Use 8+ characters"
        };
    }

    if (score <= 2) {
        return {
            score: 1,
            label: "Weak",
            hint: "Add more character types"
        };
    }

    if (score === 3) {
        return {
            score: 2,
            label: "Fair",
            hint: "Add more security"
        };
    }

    if (score === 4) {
        return {
            score: 3,
            label: "Good",
            hint: "Almost there"
        };
    }

    return {
        score: 4,
        label: "Strong",
        hint: "Strong password"
    };
}


// =========================================================
// REQUIREMENT UI
// =========================================================

function updateRequirement(element, valid) {

    if (!element) return;

    const icon = element.querySelector("i");

    if (valid) {

        element.classList.add("valid");

        if (icon) {
            icon.className = "bi bi-check-circle-fill";
        }

    } else {

        element.classList.remove("valid");

        if (icon) {
            icon.className = "bi bi-circle";
        }
    }
}


function updatePasswordStrength() {

    const password = newPasswordInput.value;

    const rules = getPasswordRules(password);
    const strength = getPasswordStrength(password);

    updateRequirement(
        requirementLength,
        rules.length
    );

    updateRequirement(
        requirementUppercase,
        rules.uppercase
    );

    updateRequirement(
        requirementLowercase,
        rules.lowercase
    );

    updateRequirement(
        requirementNumber,
        rules.number
    );

    updateRequirement(
        requirementSpecial,
        rules.special
    );


    strengthBars.forEach((bar, index) => {

        bar.style.background = "";

        if (index < strength.score) {

            if (strength.score === 1) {
                bar.style.background = "#dc3545";
            } else if (strength.score === 2) {
                bar.style.background = "#d97706";
            } else if (strength.score === 3) {
                bar.style.background = "#0f766e";
            } else if (strength.score === 4) {
                bar.style.background = "#15803d";
            }
        }
    });


    resetStrengthLabel.textContent =
        strength.label;

    resetStrengthHint.textContent =
        strength.hint;
}


newPasswordInput.addEventListener(
    "input",
    updatePasswordStrength
);


// =========================================================
// HELPERS
// =========================================================

function showError(message) {

    resetErrorText.textContent = message;

    resetError.classList.remove("d-none");

    resetSuccess.classList.add("d-none");
}


function showSuccess(message) {

    resetSuccessText.textContent = message;

    resetSuccess.classList.remove("d-none");

    resetError.classList.add("d-none");
}


function clearMessages() {

    resetError.classList.add("d-none");

    resetSuccess.classList.add("d-none");

    resetErrorText.textContent = "";

    resetSuccessText.textContent = "";
}


function clearFieldErrors() {

    newPasswordError.textContent = "";
    confirmPasswordError.textContent = "";

    newPasswordError.classList.remove("show");
    confirmPasswordError.classList.remove("show");

    newPasswordInput.classList.remove("input-error");
    confirmPasswordInput.classList.remove("input-error");
}


function setFieldError(element, message) {

    element.textContent = message;

    element.classList.add("show");
}


function setLoading(loading) {

    resetButton.disabled = loading;

    if (loading) {

        resetButtonText.textContent =
            "Resetting password...";

        resetSpinner.classList.remove("d-none");

        resetArrow.classList.add("d-none");

    } else {

        resetButtonText.textContent =
            "Reset password";

        resetSpinner.classList.add("d-none");

        resetArrow.classList.remove("d-none");
    }
}


function getResetToken() {

    const params = new URLSearchParams(
        window.location.search
    );

    return (
        params.get("token") ||
        sessionStorage.getItem("medicore_reset_token") ||
        localStorage.getItem("medicore_reset_token")
    );
}


function getResetEmail() {

    return (
        sessionStorage.getItem("medicore_reset_email") ||
        ""
    );
}


// =========================================================
// FORM SUBMISSION
// =========================================================

resetForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    clearMessages();
    clearFieldErrors();

    const newPassword =
        newPasswordInput.value.trim();

    const confirmPassword =
        confirmPasswordInput.value.trim();

    const token = getResetToken();

    const email = getResetEmail();


    // -----------------------------------------
    // Token validation
    // -----------------------------------------

    if (!token) {

        showError(
            "Your password reset link is missing or has expired. Please request a new reset link."
        );

        return;
    }


    // -----------------------------------------
    // Password validation
    // -----------------------------------------

    const rules =
        getPasswordRules(newPassword);

    const passwordIsStrong =
        Object.values(rules).every(Boolean);


    if (!passwordIsStrong) {

        setFieldError(
            newPasswordError,
            "Password must contain 8+ characters, uppercase, lowercase, number and special character."
        );

        newPasswordInput.focus();

        return;
    }


    if (newPassword !== confirmPassword) {

        setFieldError(
            confirmPasswordError,
            "Passwords do not match."
        );

        confirmPasswordInput.focus();

        return;
    }


    setLoading(true);


    try {

        const response =
            await window.mediCoreAPI.post(
                "/auth/reset-password",
                {
                    email,
                    token,
                    newPassword
                }
            );


        if (!response.data?.success) {

            throw new Error(
                response.data?.message ||
                "Unable to reset your password."
            );
        }


        showSuccess(
            "Your password has been reset successfully. Redirecting you to sign in..."
        );


        // Remove temporary recovery data
        sessionStorage.removeItem(
            "medicore_reset_token"
        );

        sessionStorage.removeItem(
            "medicore_reset_email"
        );

        localStorage.removeItem(
            "medicore_reset_token"
        );


        resetForm.reset();

        updatePasswordStrength();


        // Redirect after successful reset
        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1800);


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );


        const status =
            error.response?.status;

        const message =
            error.response?.data?.message;


        if (status === 400) {

            showError(
                message ||
                "The reset token is invalid or has expired."
            );

        } else if (status === 404) {

            showError(
                "The account associated with this reset request could not be found."
            );

        } else if (!error.response) {

            showError(
                "Unable to connect to the MediCore server. Please make sure the backend is running."
            );

        } else {

            showError(
                message ||
                "Something went wrong while resetting your password."
            );
        }

    } finally {

        setLoading(false);
    }
});


// =========================================================
// LIVE CONFIRM PASSWORD VALIDATION
// =========================================================

confirmPasswordInput.addEventListener(
    "input",
    () => {

        if (!confirmPasswordInput.value) {
            confirmPasswordError.classList.remove("show");
            confirmPasswordInput.classList.remove("input-error");
            return;
        }


        if (
            confirmPasswordInput.value !==
            newPasswordInput.value
        ) {

            setFieldError(
                confirmPasswordError,
                "Passwords do not match."
            );

            confirmPasswordInput.classList.add(
                "input-error"
            );

        } else {

            confirmPasswordError.textContent = "";

            confirmPasswordError.classList.remove(
                "show"
            );

            confirmPasswordInput.classList.remove(
                "input-error"
            );
        }
    }
);


// =========================================================
// INITIAL UI
// =========================================================

updatePasswordStrength();