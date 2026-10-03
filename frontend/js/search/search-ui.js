const categoryIcons = {
    Patients: "P",
    Doctors: "D",
    Appointments: "A",
    Invoices: "I",
    Medicines: "M",
    "Lab Tests": "L",
    Prescriptions: "Rx",
    Reports: "R"
};

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderSearchLoading(container) {
    container.innerHTML = `
        <div class="mc-search-loading">
            <div class="spinner-border spinner-border-sm me-2"></div>
            Searching MEDICORE...
        </div>
    `;
}

function renderSearchResults(results, query, container) {
    if (!results.length) {
        container.innerHTML = `
            <div class="mc-search-no-results">
                <h5>No results found for "${escapeHtml(query)}"</h5>
                <p class="mb-1">Check spelling or try another search.</p>
                <p class="small">Search another module.</p>
            </div>
        `;
        return;
    }

    const groups = results.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }

        acc[item.category].push(item);
        return acc;
    }, {});

    container.innerHTML = Object.entries(groups)
        .map(([category, items]) => `
            <section class="mc-search-group">
                <div class="mc-search-group-title">
                    <span>${escapeHtml(category)}</span>
                    <span>${items.length}</span>
                </div>

                ${items.map((item) => `
                    <div
                        class="mc-search-result"
                        data-search-url="${escapeHtml(item.url)}"
                        tabindex="-1"
                    >
                        <div class="mc-search-result-icon">
                            ${escapeHtml(categoryIcons[category] || "•")}
                        </div>

                        <div class="mc-search-result-content">
                            <div class="mc-search-result-title">
                                ${escapeHtml(item.title)}
                            </div>

                            <div class="mc-search-result-subtitle">
                                ${escapeHtml(item.subtitle || category)}
                            </div>
                        </div>

                        <div class="mc-search-result-arrow">→</div>
                    </div>
                `).join("")}
            </section>
        `)
        .join("");

    container.querySelectorAll(".mc-search-result").forEach((item) => {
        item.addEventListener("click", () => {
            window.location.href = item.dataset.searchUrl;
        });
    });
}

function renderPageSearch(results, query) {
    const container = document.getElementById("searchResultsPage");
    const state = document.getElementById("searchState");

    if (!container) return;

    if (!query.trim()) {
        container.innerHTML = "";
        if (state) state.style.display = "block";
        return;
    }

    if (state) state.style.display = "none";

    if (searchData.loading) {
        renderSearchLoading(container);
        return;
    }

    renderSearchResults(results, query, container);
}