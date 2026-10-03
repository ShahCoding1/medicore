(function () {
    "use strict";

    const THEME_KEY = "medicore_theme";

    function getPreferredTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);

        if (savedTheme === "dark" || savedTheme === "light") {
            return savedTheme;
        }

        return window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    function applyTheme(theme) {
        const normalizedTheme = theme === "dark" ? "dark" : "light";

        document.documentElement.setAttribute(
            "data-theme",
            normalizedTheme
        );

        document.body?.classList.toggle(
            "theme-dark",
            normalizedTheme === "dark"
        );

        document.body?.classList.toggle(
            "theme-light",
            normalizedTheme === "light"
        );

        localStorage.setItem(THEME_KEY, normalizedTheme);

        updateThemeToggle(normalizedTheme);

        window.dispatchEvent(
            new CustomEvent("medicore:themechange", {
                detail: {
                    theme: normalizedTheme
                }
            })
        );
    }

    function toggleTheme() {
        const currentTheme =
            document.documentElement.getAttribute("data-theme") ||
            getPreferredTheme();

        applyTheme(
            currentTheme === "dark"
                ? "light"
                : "dark"
        );
    }

    function createThemeToggle() {
        if (document.getElementById("medicoreThemeToggle")) {
            return;
        }

        const button = document.createElement("button");

        button.id = "medicoreThemeToggle";
        button.type = "button";
        button.className = "medicore-theme-toggle";
        button.setAttribute(
            "aria-label",
            "Toggle dark mode"
        );
        button.setAttribute(
            "title",
            "Toggle dark mode"
        );

        button.innerHTML = `
            <span class="theme-toggle-icon theme-toggle-sun" aria-hidden="true">
                ☀
            </span>

            <span class="theme-toggle-icon theme-toggle-moon" aria-hidden="true">
                ☾
            </span>

            <span class="theme-toggle-label">
                Theme
            </span>
        `;

        button.addEventListener("click", toggleTheme);

        /*
         * Try to place the toggle inside the application header.
         */
        const headerActions =
            document.querySelector(
                ".header-actions"
            ) ||
            document.querySelector(
                ".app-header-actions"
            ) ||
            document.querySelector(
                ".topbar-actions"
            ) ||
            document.querySelector(
                ".navbar-actions"
            ) ||
            document.querySelector(
                ".header-right"
            );

        if (headerActions) {
            headerActions.appendChild(button);
            return;
        }

        /*
         * Fallback:
         * create a small fixed theme button.
         */
        document.body.appendChild(button);
    }

    function updateThemeToggle(theme) {
        const button =
            document.getElementById(
                "medicoreThemeToggle"
            );

        if (!button) {
            return;
        }

        const isDark = theme === "dark";

        button.setAttribute(
            "aria-label",
            isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
        );

        button.setAttribute(
            "title",
            isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
        );

        button.classList.toggle(
            "is-dark",
            isDark
        );

        const label =
            button.querySelector(
                ".theme-toggle-label"
            );

        if (label) {
            label.textContent =
                isDark
                    ? "Dark"
                    : "Light";
        }
    }

    /*
     * Apply theme as early as possible.
     */
    applyTheme(
        getPreferredTheme()
    );

    /*
     * Build the toggle after the DOM is ready.
     */
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            createThemeToggle
        );
    } else {
        createThemeToggle();
    }

    /*
     * Public API.
     */
    window.MediCoreTheme = {
        getTheme: function () {
            return (
                document.documentElement.getAttribute(
                    "data-theme"
                ) || getPreferredTheme()
            );
        },

        setTheme: function (theme) {
            applyTheme(theme);
        },

        toggle: function () {
            toggleTheme();
        }
    };
})();