// ==========================================
// MEDICORE AUTHENTICATION UI
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    setupLogin();
    setupRegistration();
});

// ==========================================
// LOGIN
// ==========================================

function setupLogin() {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");

    const loginButton = document.getElementById("loginButton");
    const loginButtonText = document.getElementById("loginButtonText");
    const loginSpinner = document.getElementById("loginSpinner");
    const loginError = document.getElementById("loginError");

    togglePassword?.addEventListener("click", () => {
        const visible = passwordInput.type === "text";

        passwordInput.type = visible ? "password" : "text";
        togglePassword.textContent = visible ? "Show" : "Hide";
    });

    [emailInput, passwordInput].forEach((input) => {
        input?.addEventListener("input", () => {
            input.classList.remove("is-invalid");

            loginError?.classList.add("d-none");
        });
    });

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        let valid = true;

        if (!email || !emailInput.checkValidity()) {
            emailInput.classList.add("is-invalid");
            valid = false;
        }

        if (!password || password.length < 8) {
            passwordInput.classList.add("is-invalid");
            valid = false;
        }

        if (!valid) return;

        loginButton.disabled = true;
        loginButtonText.textContent = "Signing in...";
        loginSpinner.classList.remove("d-none");
        loginError.classList.add("d-none");

        const result = await window.mediCoreAuth.loginUser(
            email,
            password
        );

        if (result.success) {
            loginButtonText.textContent = "Success!";

            setTimeout(() => {
                window.location.href = "onboarding.html";
            }, 400);

            return;
        }

        loginButton.disabled = false;
        loginButtonText.textContent = "Sign in";
        loginSpinner.classList.add("d-none");

        loginError.textContent = result.message;
        loginError.classList.remove("d-none");
    });
}

// ==========================================
// REGISTRATION
// ==========================================

function setupRegistration() {
    const registerForm = document.getElementById("registerForm");

    if (!registerForm) return;

    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const email = document.getElementById("registerEmail");
    const phone = document.getElementById("registerPhone");
    const password = document.getElementById("registerPassword");
    const confirmPassword = document.getElementById("confirmPassword");

    const togglePassword =
        document.getElementById("toggleRegisterPassword");

    const strengthText =
        document.getElementById("passwordStrengthText");

    const registerButton =
        document.getElementById("registerButton");

    const registerButtonText =
        document.getElementById("registerButtonText");

    const registerSpinner =
        document.getElementById("registerSpinner");

    const registerError =
        document.getElementById("registerError");

    const registerSuccess =
        document.getElementById("registerSuccess");

    // Show / hide password
    togglePassword?.addEventListener("click", () => {
        const visible = password.type === "text";

        password.type = visible ? "password" : "text";
        togglePassword.textContent = visible ? "Show" : "Hide";
    });

    // Password strength
    password.addEventListener("input", () => {
        const value = password.value;

        let score = 0;

        if (value.length >= 8) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[a-z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;

        if (!value) {
            strengthText.textContent =
                "Use 8+ characters with uppercase, lowercase, number and special character.";
            strengthText.className = "small text-muted";
        } else if (score <= 2) {
            strengthText.textContent = "Password strength: Weak";
            strengthText.className = "small text-danger";
        } else if (score === 3) {
            strengthText.textContent = "Password strength: Fair";
            strengthText.className = "small text-warning";
        } else if (score === 4) {
            strengthText.textContent = "Password strength: Good";
            strengthText.className = "small text-info";
        } else {
            strengthText.textContent = "Password strength: Strong";
            strengthText.className = "small text-success";
        }
    });

    // Clear validation errors
    [
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword
    ].forEach((input) => {
        input?.addEventListener("input", () => {
            input.classList.remove("is-invalid");
            registerError?.classList.add("d-none");
        });
    });

    // Submit registration
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        registerError.classList.add("d-none");
        registerSuccess.classList.add("d-none");

        const first = firstName.value.trim();
        const last = lastName.value.trim();
        const emailValue = email.value.trim().toLowerCase();
        const phoneValue = phone.value.trim();
        const passwordValue = password.value;
        const confirmValue = confirmPassword.value;

        let valid = true;

        if (first.length < 2) {
            firstName.classList.add("is-invalid");
            valid = false;
        }

        if (last.length < 2) {
            lastName.classList.add("is-invalid");
            valid = false;
        }

        if (!emailValue || !email.checkValidity()) {
            email.classList.add("is-invalid");
            valid = false;
        }

        if (passwordValue.length < 8) {
            password.classList.add("is-invalid");
            valid = false;
        }

        if (passwordValue !== confirmValue) {
            confirmPassword.classList.add("is-invalid");
            valid = false;
        }

        if (!valid) return;

        registerButton.disabled = true;
        registerButtonText.textContent = "Creating account...";
        registerSpinner.classList.remove("d-none");

        const result = await window.mediCoreAuth.registerUser({
            name: `${first} ${last}`,
            email: emailValue,
            password: passwordValue,
            phone: phoneValue
        });

        if (result.success) {
            registerButtonText.textContent = "Account created!";

            registerSuccess.textContent =
                "Your account has been created successfully. Redirecting...";

            registerSuccess.classList.remove("d-none");

            setTimeout(() => {
                window.location.href = "pages/dashboard.html";
            }, 800);

            return;
        }

        registerButton.disabled = false;
        registerButtonText.textContent = "Create account";
        registerSpinner.classList.add("d-none");

        registerError.textContent = result.message;
        registerError.classList.remove("d-none");
    });
}

function setupForgotPassword() {
    const form = document.getElementById("forgotPasswordForm");

    if (!form) return;

    const emailInput = document.getElementById("forgotEmail");
    const button = document.getElementById("forgotButton");
    const buttonText = document.getElementById("forgotButtonText");
    const spinner = document.getElementById("forgotSpinner");

    const errorBox = document.getElementById("forgotError");
    const successBox = document.getElementById("forgotSuccess");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        errorBox.classList.add("d-none");
        successBox.classList.add("d-none");

        const email = emailInput.value.trim().toLowerCase();

        if (!email || !emailInput.checkValidity()) {
            emailInput.classList.add("is-invalid");
            return;
        }

        emailInput.classList.remove("is-invalid");

        button.disabled = true;
        buttonText.textContent = "Sending...";
        spinner.classList.remove("d-none");

        try {
            const response = await window.mediCoreAPI.post(
                "/auth/forgot-password",
                { email }
            );

            successBox.textContent =
                response.data.message ||
                "If an account exists for this email, password reset instructions have been sent.";

            successBox.classList.remove("d-none");
        } catch (error) {
            errorBox.textContent =
                error.response?.data?.message ||
                "Unable to process your request. Please try again.";

            errorBox.classList.remove("d-none");
        } finally {
            button.disabled = false;
            buttonText.textContent = "Send reset instructions";
            spinner.classList.add("d-none");
        }
    });
}

setupForgotPassword();

function setupResetPassword() {
    const form = document.getElementById("resetPasswordForm");

    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    const newPassword = document.getElementById("newPassword");
    const confirmPassword =
        document.getElementById("confirmNewPassword");

    const togglePassword =
        document.getElementById("toggleNewPassword");

    const strength =
        document.getElementById("resetPasswordStrength");

    const button = document.getElementById("resetButton");
    const buttonText = document.getElementById("resetButtonText");
    const spinner = document.getElementById("resetSpinner");

    const errorBox = document.getElementById("resetError");
    const successBox = document.getElementById("resetSuccess");

    if (!token) {
        errorBox.textContent =
            "This password reset link is invalid or incomplete.";
        errorBox.classList.remove("d-none");
        button.disabled = true;
        return;
    }

    togglePassword?.addEventListener("click", () => {
        const visible = newPassword.type === "text";

        newPassword.type = visible ? "password" : "text";
        togglePassword.textContent = visible ? "Show" : "Hide";
    });

    newPassword.addEventListener("input", () => {
        const value = newPassword.value;

        let score = 0;

        if (value.length >= 8) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[a-z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;

        if (!value) {
            strength.textContent =
                "Use 8+ characters with uppercase, lowercase, number and special character.";
            strength.className = "small text-muted mt-2";
        } else if (score <= 2) {
            strength.textContent = "Password strength: Weak";
            strength.className = "small text-danger mt-2";
        } else if (score === 3) {
            strength.textContent = "Password strength: Fair";
            strength.className = "small text-warning mt-2";
        } else if (score === 4) {
            strength.textContent = "Password strength: Good";
            strength.className = "small text-info mt-2";
        } else {
            strength.textContent = "Password strength: Strong";
            strength.className = "small text-success mt-2";
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        errorBox.classList.add("d-none");
        successBox.classList.add("d-none");

        const password = newPassword.value;
        const confirmation = confirmPassword.value;

        const strong =
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password);

        if (!strong) {
            errorBox.textContent =
                "Password must contain at least 8 characters, including uppercase, lowercase, number and special character.";
            errorBox.classList.remove("d-none");
            return;
        }

        if (password !== confirmation) {
            confirmPassword.classList.add("is-invalid");
            return;
        }

        confirmPassword.classList.remove("is-invalid");

        button.disabled = true;
        buttonText.textContent = "Resetting...";
        spinner.classList.remove("d-none");

        try {
            const response = await window.mediCoreAPI.post(
                "/auth/reset-password",
                {
                    token,
                    password
                }
            );

            successBox.textContent =
                response.data.message ||
                "Password reset successfully.";

            successBox.classList.remove("d-none");

            form.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } catch (error) {
            errorBox.textContent =
                error.response?.data?.message ||
                "Unable to reset your password. Please try again.";

            errorBox.classList.remove("d-none");

            button.disabled = false;
            buttonText.textContent = "Reset password";
            spinner.classList.add("d-none");
        }
    });
}

setupResetPassword();

function setupEmailVerification() {
    const resendButton = document.getElementById("resendVerification");

    if (!resendButton) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");

    const errorBox = document.getElementById("verifyError");
    const successBox = document.getElementById("verifySuccess");
    const message = document.getElementById("verificationMessage");
    const countdown = document.getElementById("resendCountdown");

    let resendCooldown = 0;

    // Verify email when token is present
    if (token) {
        verifyEmail(token);
    }

    async function verifyEmail(verificationToken) {
        try {
            const response = await window.mediCoreAPI.post(
                "/auth/verify-email",
                {
                    token: verificationToken
                }
            );

            successBox.textContent =
                response.data.message ||
                "Email verified successfully.";

            successBox.classList.remove("d-none");

            message.textContent =
                "Your email address has been successfully verified.";
        } catch (error) {
            errorBox.textContent =
                error.response?.data?.message ||
                "This verification link is invalid or has expired.";

            errorBox.classList.remove("d-none");
        }
    }

    // Resend verification
    resendButton.addEventListener("click", async () => {
        if (!email) {
            errorBox.textContent =
                "Please open this page using the verification flow so we know which email to verify.";

            errorBox.classList.remove("d-none");
            return;
        }

        if (resendCooldown > 0) {
            return;
        }

        errorBox.classList.add("d-none");
        successBox.classList.add("d-none");

        resendButton.disabled = true;
        resendButton.textContent = "Sending...";

        try {
            const response = await window.mediCoreAPI.post(
                "/auth/resend-verification",
                {
                    email
                }
            );

            successBox.textContent =
                response.data.message ||
                "A new verification email has been sent.";

            successBox.classList.remove("d-none");

            startResendCountdown();
        } catch (error) {
            errorBox.textContent =
                error.response?.data?.message ||
                "Unable to resend verification email.";

            errorBox.classList.remove("d-none");

            resendButton.disabled = false;
            resendButton.textContent =
                "Resend verification email";
        }
    });

    function startResendCountdown() {
        resendCooldown = 60;

        const timer = setInterval(() => {
            resendCooldown--;

            countdown.textContent =
                `You can resend another email in ${resendCooldown}s`;

            if (resendCooldown <= 0) {
                clearInterval(timer);

                countdown.textContent = "";

                resendButton.disabled = false;
                resendButton.textContent =
                    "Resend verification email";
            }
        }, 1000);
    }
}

setupEmailVerification();