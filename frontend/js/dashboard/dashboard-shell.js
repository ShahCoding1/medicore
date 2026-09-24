export function initDashboardShell() {
    const user =
        window.mediCoreAuth?.getCurrentUser();

    if (!user) return;

    setupUserInformation(user);
    setupSidebar();
    setupNavigationGroups();
    setupNavigationLinks();
    setupHospitalSwitcher();
    setupProfileMenu();
    setupGlobalSearch();
    setupHelp();
    setupShellControls();
    setupOutsideClick();
}

function setupUserInformation(user) {
    const userName = user.name || "User";
    const userRole = user.role || "User";
    const userEmail =
        user.email || "No email available";

    const initial =
        userName.charAt(0).toUpperCase();

    setText("userName", userName);
    setText("userRole", userRole);
    setText("userAvatar", initial);

    setText("headerUserName", userName);
    setText("headerAvatar", initial);

    setText("profileFullName", userName);
    setText("profileEmail", userEmail);
    setText("profileRole", userRole);
}

function setupSidebar() {
    const body = document.body;

    const toggle =
        document.getElementById(
            "sidebarToggle"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );

    if (toggle) {
        toggle.addEventListener(
            "click",
            () => {
                if (window.innerWidth <= 991) {
                    body.classList.toggle(
                        "sidebar-mobile-open"
                    );
                } else {
                    body.classList.toggle(
                        "shell-sidebar-collapsed"
                    );
                }
            }
        );
    }

    if (overlay) {
        overlay.addEventListener(
            "click",
            () => {
                body.classList.remove(
                    "sidebar-mobile-open"
                );
            }
        );
    }

    window.addEventListener(
        "resize",
        () => {
            if (window.innerWidth > 991) {
                body.classList.remove(
                    "sidebar-mobile-open"
                );
            }
        }
    );
}

function setupNavigationGroups() {
    document
        .querySelectorAll(
            "[data-nav-group] .mc-nav-group-button"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    button
                        .closest("[data-nav-group]")
                        ?.classList.toggle(
                            "collapsed"
                        );
                }
            );
        });
}

function setupNavigationLinks() {
    document
        .querySelectorAll(".mc-nav-link")
        .forEach(link => {
            link.addEventListener(
                "click",
                event => {
                    const href =
                        link.getAttribute("href");

                    if (href !== "#") return;

                    event.preventDefault();

                    document
                        .querySelectorAll(
                            ".mc-nav-link"
                        )
                        .forEach(item =>
                            item.classList.remove(
                                "active"
                            )
                        );

                    link.classList.add("active");

                    if (window.innerWidth <= 991) {
                        document.body.classList.remove(
                            "sidebar-mobile-open"
                        );
                    }
                }
            );
        });
}

function setupHospitalSwitcher() {
    const switcher =
        document.getElementById(
            "hospitalSwitcher"
        );

    const menu =
        document.getElementById(
            "hospitalMenu"
        );

    if (!switcher || !menu) return;

    switcher.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            closeProfile();

            menu.classList.toggle("show");

            switcher.setAttribute(
                "aria-expanded",
                menu.classList.contains("show")
            );
        }
    );

    document
        .querySelectorAll("[data-hospital]")
        .forEach(option => {
            option.addEventListener(
                "click",
                () => {
                    setText(
                        "hospitalName",
                        option.dataset.hospital
                    );

                    setText(
                        "hospitalType",
                        "Hospital Workspace"
                    );

                    menu.classList.remove("show");

                    switcher.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            );
        });
}

function setupProfileMenu() {
    const button =
        document.getElementById(
            "profileButton"
        );

    const menu =
        document.getElementById(
            "profileMenu"
        );

    if (!button || !menu) return;

    button.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            document
                .getElementById("hospitalMenu")
                ?.classList.remove("show");

            menu.classList.toggle("show");

            button.setAttribute(
                "aria-expanded",
                menu.classList.contains("show")
            );
        }
    );

    document
        .getElementById("logoutButton")
        ?.addEventListener(
            "click",
            () => {
                window.mediCoreAuth.logout();
            }
        );
}

function closeProfile() {
    const menu =
        document.getElementById(
            "profileMenu"
        );

    const button =
        document.getElementById(
            "profileButton"
        );

    menu?.classList.remove("show");

    button?.setAttribute(
        "aria-expanded",
        "false"
    );
}

function setupGlobalSearch() {
    const input =
        document.getElementById(
            "globalSearch"
        );

    const results =
        document.getElementById(
            "searchResults"
        );

    if (!input || !results) return;

    const searchItems = [
        ["Patients", "Patients", "♙"],
        ["Patients", "Patient ID", "♙"],
        ["Doctors", "Doctors", "⚕"],
        ["Appointments", "Appointments", "◷"],
        ["Invoices", "Invoices", "▣"],
        ["Medicines", "Medicines", "▤"],
        ["Lab tests", "Lab Tests", "◈"],
        ["Prescriptions", "Prescriptions", "✓"],
        ["Reports", "Reports", "▤"]
    ];

    let selectedIndex = -1;
    let currentResults = [];

    function renderSearch(query = "") {
        const normalized =
            query.trim().toLowerCase();

        currentResults =
            searchItems.filter(item =>
                !normalized ||
                item[0]
                    .toLowerCase()
                    .includes(normalized) ||
                item[1]
                    .toLowerCase()
                    .includes(normalized)
            );

        if (!currentResults.length) {
            results.innerHTML = `
                <div class="p-3 text-muted small">
                    No matching results.
                </div>
            `;

            results.classList.add("show");
            selectedIndex = -1;

            return;
        }

        const groups = {};

        currentResults.forEach(item => {
            if (!groups[item[0]]) {
                groups[item[0]] = [];
            }

            groups[item[0]].push(item);
        });

        let html = "";

        Object.entries(groups)
            .forEach(([category, items]) => {
                html += `
                    <div class="mc-search-category">
                        ${category}
                    </div>
                `;

                items.forEach(item => {
                    const index =
                        currentResults.indexOf(item);

                    html += `
                        <button
                            class="mc-search-result ${
                                index === selectedIndex
                                    ? "selected"
                                    : ""
                            }"
                            type="button"
                            data-search-index="${index}"
                        >
                            <span class="mc-search-result-icon">
                                ${item[2]}
                            </span>

                            <span>${item[1]}</span>
                        </button>
                    `;
                });
            });

        results.innerHTML = html;
        results.classList.add("show");

        results
            .querySelectorAll(
                "[data-search-index]"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        selectSearchResult(
                            Number(
                                button.dataset
                                    .searchIndex
                            )
                        );
                    }
                );
            });
    }

    function selectSearchResult(index) {
        const item =
            currentResults[index];

        if (!item) return;

        input.value = item[1];
        results.classList.remove("show");

        console.info(
            "MediCore shell search selected:",
            item[1]
        );
    }

    input.addEventListener(
        "focus",
        () => renderSearch(input.value)
    );

    input.addEventListener(
        "input",
        () => {
            selectedIndex = -1;
            renderSearch(input.value);
        }
    );

    input.addEventListener(
        "keydown",
        event => {
            if (!results.classList.contains("show")) {
                return;
            }

            if (event.key === "ArrowDown") {
                event.preventDefault();

                selectedIndex =
                    Math.min(
                        selectedIndex + 1,
                        currentResults.length - 1
                    );

                renderSearch(input.value);
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();

                selectedIndex =
                    Math.max(
                        selectedIndex - 1,
                        0
                    );

                renderSearch(input.value);
            }

            if (event.key === "Enter") {
                event.preventDefault();

                selectSearchResult(
                    selectedIndex >= 0
                        ? selectedIndex
                        : 0
                );
            }

            if (event.key === "Escape") {
                results.classList.remove("show");
                input.blur();
            }
        }
    );

    document.addEventListener(
        "keydown",
        event => {
            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {
                event.preventDefault();

                input.focus();
                input.select();

                renderSearch(input.value);
            }
        }
    );
}

function setupHelp() {
    const helpPanel =
        document.getElementById(
            "helpPanel"
        );

    if (!helpPanel) return;

    document
        .getElementById("helpButton")
        ?.addEventListener(
            "click",
            () => {
                helpPanel.classList.add("show");
                closeProfile();

                document
                    .getElementById(
                        "hospitalMenu"
                    )
                    ?.classList.remove("show");
            }
        );

    document
        .getElementById(
            "profileHelpButton"
        )
        ?.addEventListener(
            "click",
            () => {
                closeProfile();
                helpPanel.classList.add("show");
            }
        );

    document
        .getElementById(
            "closeHelpButton"
        )
        ?.addEventListener(
            "click",
            () => {
                helpPanel.classList.remove("show");
            }
        );

    helpPanel.addEventListener(
        "click",
        event => {
            if (event.target === helpPanel) {
                helpPanel.classList.remove(
                    "show"
                );
            }
        }
    );
}

function setupShellControls() {
    document
        .getElementById("themeButton")
        ?.addEventListener(
            "click",
            () => {
                console.info(
                    "Theme control reserved for Phase 27."
                );
            }
        );

    document
        .getElementById(
            "notificationButton"
        )
        ?.addEventListener(
            "click",
            () => {
                console.info(
                    "Notification center reserved for Phase 20."
                );
            }
        );
}

function setupOutsideClick() {
    document.addEventListener(
        "click",
        event => {
            if (
                !event.target.closest(
                    ".mc-hospital-wrapper"
                )
            ) {
                document
                    .getElementById(
                        "hospitalMenu"
                    )
                    ?.classList.remove("show");
            }

            if (
                !event.target.closest(
                    ".mc-profile-wrapper"
                )
            ) {
                closeProfile();
            }

            if (
                !event.target.closest(
                    ".mc-search-wrapper"
                )
            ) {
                document
                    .getElementById(
                        "searchResults"
                    )
                    ?.classList.remove("show");
            }
        }
    );
}

function setText(id, value) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}