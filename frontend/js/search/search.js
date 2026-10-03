document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("pageSearchInput");

    if (!input) return;

    const runSearch = async () => {
        const query = input.value;

        renderPageSearch([], query);

        if (query.trim().length < 2) {
            return;
        }

        renderSearchLoading(document.getElementById("searchResultsPage"));

        const results = await performGlobalSearch(query);

        renderPageSearch(results, query);
    };

    input.addEventListener("input", () => {
        clearTimeout(searchData.timer);

        searchData.timer = setTimeout(runSearch, 300);
    });

    input.addEventListener("keydown", (event) => {
        const results = document.querySelectorAll(
            "#searchResultsPage .mc-search-result"
        );

        if (!results.length) {
            if (event.key === "Escape") {
                input.value = "";
                renderPageSearch([], "");
            }
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();

            searchData.activeIndex =
                Math.min(
                    searchData.activeIndex + 1,
                    results.length - 1
                );

            updateActiveSearchResult(results);
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            searchData.activeIndex =
                Math.max(searchData.activeIndex - 1, 0);

            updateActiveSearchResult(results);
        }

        if (event.key === "Enter") {
            event.preventDefault();

            const active =
                results[searchData.activeIndex];

            if (active) {
                window.location.href =
                    active.dataset.searchUrl;
            }
        }

        if (event.key === "Escape") {
            input.value = "";
            renderPageSearch([], "");
            input.blur();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {
            event.preventDefault();

            input.focus();
            input.select();
        }

        if (event.key === "Escape" && document.activeElement === input) {
            input.value = "";
            renderPageSearch([], "");
            input.blur();
        }
    });
});

function updateActiveSearchResult(results) {
    results.forEach((item, index) => {
        item.classList.toggle(
            "active",
            index === searchData.activeIndex
        );
    });

    const active =
        results[searchData.activeIndex];

    if (active) {
        active.scrollIntoView({
            block: "nearest"
        });
    }
}