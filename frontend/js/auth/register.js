/* =========================================================
   MEDICORE REGISTRATION
   Administrator Account — Step 1
   ========================================================= */


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const registerForm =
    document.getElementById("registerForm");

const firstNameInput =
    document.getElementById("firstName");

const lastNameInput =
    document.getElementById("lastName");

const emailInput =
    document.getElementById("registerEmail");

const phoneInput =
    document.getElementById("registerPhone");

const passwordInput =
    document.getElementById("registerPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const acceptTerms =
    document.getElementById("acceptTerms");

const togglePassword =
    document.getElementById("toggleRegisterPassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

const registerButton =
    document.getElementById("registerButton");

const registerButtonText =
    document.getElementById("registerButtonText");

const registerSpinner =
    document.getElementById("registerSpinner");

const registerArrow =
    document.getElementById("registerArrow");

const registerError =
    document.getElementById("registerError");

const registerErrorText =
    document.getElementById("registerErrorText");

const registerSuccess =
    document.getElementById("registerSuccess");

const registerSuccessText =
    document.getElementById("registerSuccessText");

const passwordStrength =
    document.querySelector(".password-strength");

const passwordStrengthText =
    document.getElementById("passwordStrengthText");

const passwordStrengthLabel =
    document.getElementById("passwordStrengthLabel");

const currentYear =
    document.getElementById("currentYear");


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeRegistration
);


function initializeRegistration() {

    if (currentYear) {
        currentYear.textContent =
            new Date().getFullYear();
    }

    bindRegistrationEvents();

}


/* =========================================================
   EVENT BINDINGS
   ========================================================= */

function bindRegistrationEvents() {

    registerForm?.addEventListener(
        "submit",
        handleRegistration
    );


    togglePassword?.addEventListener(
        "click",
        () => togglePasswordVisibility(
            passwordInput,
            togglePassword
        )
    );


    toggleConfirmPassword?.addEventListener(
        "click",
        () => togglePasswordVisibility(
            confirmPasswordInput,
            toggleConfirmPassword
        )
    );


    passwordInput?.addEventListener(
        "input",
        handlePasswordInput
    );


    confirmPasswordInput?.addEventListener(
        "input",
        handleConfirmPasswordInput
    );


    firstNameInput?.addEventListener(
        "input",
        () => clearFieldError(
            firstNameInput,
            document.getElementById("firstNameError")
        )
    );


    lastNameInput?.addEventListener(
        "input",
        () => clearFieldError(
            lastNameInput,
            document.getElementById("lastNameError")
        )
    );


    emailInput?.addEventListener(
        "input",
        () => clearFieldError(
            emailInput,
            document.getElementById("registerEmailError")
        )
    );


    phoneInput?.addEventListener(
        "input",
        () => clearFieldError(
            phoneInput,
            document.getElementById("registerPhoneError")
        )
    );


    acceptTerms?.addEventListener(
        "change",
        () => {

            const termsError =
                document.getElementById("termsError");

            if (acceptTerms.checked) {
                termsError.textContent = "";
            }

        }
    );

}


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

function togglePasswordVisibility(
    input,
    button
) {

    if (!input || !button) {
        return;
    }

    const isPassword =
        input.type === "password";


    input.type =
        isPassword ? "text" : "password";


    button.innerHTML = isPassword
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';


    button.setAttribute(
        "aria-label",
        isPassword
            ? "Hide password"
            : "Show password"
    );

}


/* =========================================================
   PASSWORD STRENGTH
   ========================================================= */

function handlePasswordInput() {

    const password =
        passwordInput.value;

    updatePasswordStrength(password);

    clearFieldError(
        passwordInput,
        document.getElementById(
            "registerPasswordError"
        )
    );


    if (
        confirmPasswordInput.value &&
        confirmPasswordInput.value !== password
    ) {

        showFieldError(
            confirmPasswordInput,
            document.getElementById(
                "confirmPasswordError"
            ),
            "Passwords do not match."
        );

    } else {

        clearFieldError(
            confirmPasswordInput,
            document.getElementById(
                "confirmPasswordError"
            )
        );

    }

}


/* =========================================================
   PASSWORD STRENGTH CALCULATION
   ========================================================= */

function getPasswordStrength(password) {

    if (!password) {
        return {
            score: 0,
            label: "—",
            className: ""
        };
    }


    let score = 0;


    if (password.length >= 8) {
        score++;
    }

    if (/[a-z]/.test(password)) {
        score++;
    }

    if (/[A-Z]/.test(password)) {
        score++;
    }

    if (/[0-9]/.test(password)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score++;
    }


    if (score <= 2) {

        return {
            score,
            label: "Weak",
            className: "weak"
        };

    }


    if (score === 3) {

        return {
            score,
            label: "Fair",
            className: "fair"
        };

    }


    if (score === 4) {

        return {
            score,
            label: "Good",
            className: "good"
        };

    }


    return {
        score,
        label: "Strong",
        className: "strong"
    };

}


/* =========================================================
   UPDATE PASSWORD STRENGTH UI
   ========================================================= */

function updatePasswordStrength(password) {

    if (!passwordStrength) {
        return;
    }


    const result =
        getPasswordStrength(password);


    passwordStrength.classList.remove(
        "weak",
        "fair",
        "good",
        "strong"
    );


    if (result.className) {

        passwordStrength.classList.add(
            result.className
        );

    }


    passwordStrengthLabel.textContent =
        result.label;


    if (!password) {

        passwordStrengthText.textContent =
            "Use 8+ characters with uppercase, lowercase, number and special character.";

        return;
    }


    if (result.className === "weak") {

        passwordStrengthText.textContent =
            "Weak password. Add more characters and a combination of uppercase, lowercase, numbers and symbols.";

        return;
    }


    if (result.className === "fair") {

        passwordStrengthText.textContent =
            "Fair password. Add another character type to make it stronger.";

        return;
    }


    if (result.className === "good") {

        passwordStrengthText.textContent =
            "Good password. Add a special character or increase the length for stronger protection.";

        return;
    }


    passwordStrengthText.textContent =
        "Strong password. Your password meets the recommended requirements.";

}


/* =========================================================
   CONFIRM PASSWORD
   ========================================================= */

function handleConfirmPasswordInput() {

    const confirmPassword =
        confirmPasswordInput.value;

    const password =
        passwordInput.value;

    const errorElement =
        document.getElementById(
            "confirmPasswordError"
        );


    if (!confirmPassword) {

        clearFieldError(
            confirmPasswordInput,
            errorElement
        );

        return;
    }


    if (confirmPassword !== password) {

        showFieldError(
            confirmPasswordInput,
            errorElement,
            "Passwords do not match."
        );

        return;
    }


    clearFieldError(
        confirmPasswordInput,
        errorElement
    );

}


/* =========================================================
   REGISTRATION
   ========================================================= */

async function handleRegistration(event) {

    event.preventDefault();

    clearMessages();

    const formData =
        getRegistrationData();


    const isValid =
        validateRegistration(formData);


    if (!isValid) {
        return;
    }


    setLoadingState(true);


    try {

        const response =
            await window.mediCoreAPI.post(
                "/auth/register",
                {
                    name:
                        `${formData.firstName} ${formData.lastName}`.trim(),

                    email:
                        formData.email,

                    password:
                        formData.password,

                    phone:
                        formData.phone
                }
            );


        const data =
            response.data;


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to create your account."
            );

        }


        /*
         * Store authentication data.
         */

        if (data.token) {

            localStorage.setItem(
                "medicore_token",
                data.token
            );

        }


        if (data.user) {

            localStorage.setItem(
                "medicore_user",
                JSON.stringify(data.user)
            );

        }


        /*
         * Save registration email so the
         * verification page can use it.
         */

        sessionStorage.setItem(
            "medicore_registration_email",
            formData.email
        );


        showSuccess(
            "Your account has been created successfully."
        );


        /*
         * Move to email verification.
         */

        setTimeout(() => {

            window.location.href =
                "verify-email.html";

        }, 800);


    } catch (error) {

        console.error(
            "MediCore registration error:",
            error
        );


        handleRegistrationError(error);

    } finally {

        setLoadingState(false);

    }

}


/* =========================================================
   GET FORM DATA
   ========================================================= */

function getRegistrationData() {

    return {

        firstName:
            firstNameInput.value.trim(),

        lastName:
            lastNameInput.value.trim(),

        email:
            emailInput.value.trim().toLowerCase(),

        phone:
            phoneInput.value.trim(),

        password:
            passwordInput.value,

        confirmPassword:
            confirmPasswordInput.value,

        termsAccepted:
            acceptTerms.checked

    };

}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateRegistration(data) {

    let valid = true;


    /*
     * First name
     */

    if (!data.firstName) {

        showFieldError(
            firstNameInput,
            document.getElementById(
                "firstNameError"
            ),
            "First name is required."
        );

        valid = false;

    } else if (data.firstName.length < 2) {

        showFieldError(
            firstNameInput,
            document.getElementById(
                "firstNameError"
            ),
            "First name must contain at least 2 characters."
        );

        valid = false;

    }


    /*
     * Last name
     */

    if (!data.lastName) {

        showFieldError(
            lastNameInput,
            document.getElementById(
                "lastNameError"
            ),
            "Last name is required."
        );

        valid = false;

    } else if (data.lastName.length < 2) {

        showFieldError(
            lastNameInput,
            document.getElementById(
                "lastNameError"
            ),
            "Last name must contain at least 2 characters."
        );

        valid = false;

    }


    /*
     * Email
     */

    if (!data.email) {

        showFieldError(
            emailInput,
            document.getElementById(
                "registerEmailError"
            ),
            "Email address is required."
        );

        valid = false;

    } else if (!isValidEmail(data.email)) {

        showFieldError(
            emailInput,
            document.getElementById(
                "registerEmailError"
            ),
            "Please enter a valid email address."
        );

        valid = false;

    }


    /*
     * Phone
     *
     * Optional, but if provided we perform
     * a basic validation.
     */

    if (
        data.phone &&
        !isValidPhone(data.phone)
    ) {

        showFieldError(
            phoneInput,
            document.getElementById(
                "registerPhoneError"
            ),
            "Please enter a valid phone number."
        );

        valid = false;

    }


    /*
     * Password
     */

    if (!data.password) {

        showFieldError(
            passwordInput,
            document.getElementById(
                "registerPasswordError"
            ),
            "Password is required."
        );

        valid = false;

    } else if (data.password.length < 8) {

        showFieldError(
            passwordInput,
            document.getElementById(
                "registerPasswordError"
            ),
            "Password must contain at least 8 characters."
        );

        valid = false;

    } else if (!isStrongPassword(data.password)) {

        showFieldError(
            passwordInput,
            document.getElementById(
                "registerPasswordError"
            ),
            "Use uppercase, lowercase, number and special character."
        );

        valid = false;

    }


    /*
     * Confirm password
     */

    if (!data.confirmPassword) {

        showFieldError(
            confirmPasswordInput,
            document.getElementById(
                "confirmPasswordError"
            ),
            "Please confirm your password."
        );

        valid = false;

    } else if (
        data.password !==
        data.confirmPassword
    ) {

        showFieldError(
            confirmPasswordInput,
            document.getElementById(
                "confirmPasswordError"
            ),
            "Passwords do not match."
        );

        valid = false;

    }


    /*
     * Terms
     */

    if (!data.termsAccepted) {

        document.getElementById(
            "termsError"
        ).textContent =
            "Please accept the Terms of Service and Privacy Policy.";

        valid = false;

    }


    return valid;

}


/* =========================================================
   PASSWORD VALIDATION
   ========================================================= */

function isStrongPassword(password) {

    return (
        password.length >= 8 &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );

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
   PHONE VALIDATION
   ========================================================= */

function isValidPhone(phone) {

    const normalized =
        phone.replace(/[\s\-()+]/g, "");

    return /^\d{7,15}$/.test(
        normalized
    );

}


/* =========================================================
   FIELD ERROR
   ========================================================= */

function showFieldError(
    input,
    errorElement,
    message
) {

    input
        .closest(".input-wrapper")
        ?.classList.add("input-error");


    errorElement.textContent =
        message;

}


function clearFieldError(
    input,
    errorElement
) {

    if (!input || !errorElement) {
        return;
    }


    input
        .closest(".input-wrapper")
        ?.classList.remove("input-error");


    errorElement.textContent = "";

}


/* =========================================================
   API ERROR HANDLING
   ========================================================= */

function handleRegistrationError(error) {

    const status =
        error.response?.status;

    const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to create your account.";


    /*
     * Existing email.
     */

    if (status === 400) {

        showError(message);

        return;
    }


    /*
     * Validation error.
     */

    if (status === 422) {

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

    registerErrorText.textContent =
        message;

    registerError.classList.remove(
        "d-none"
    );

    registerSuccess.classList.add(
        "d-none"
    );

}


function showSuccess(message) {

    registerSuccessText.textContent =
        message;

    registerSuccess.classList.remove(
        "d-none"
    );

    registerError.classList.add(
        "d-none"
    );

}


function clearMessages() {

    registerError.classList.add(
        "d-none"
    );

    registerSuccess.classList.add(
        "d-none"
    );

    registerErrorText.textContent = "";

    registerSuccessText.textContent = "";

}


/* =========================================================
   LOADING STATE
   ========================================================= */

function setLoadingState(isLoading) {

    registerButton.disabled =
        isLoading;


    if (isLoading) {

        registerButtonText.classList.add(
            "d-none"
        );

        registerArrow.classList.add(
            "d-none"
        );

        registerSpinner.classList.remove(
            "d-none"
        );

    } else {

        registerButtonText.classList.remove(
            "d-none"
        );

        registerArrow.classList.remove(
            "d-none"
        );

        registerSpinner.classList.add(
            "d-none"
        );

    }

}


/* =========================================================
   DEBUG ACCESS
   ========================================================= */

window.mediCoreRegistration = {

    validateRegistration,

    getPasswordStrength,

    clearMessages,

    showError,

    showSuccess

};