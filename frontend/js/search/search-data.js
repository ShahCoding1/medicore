const searchData = {
    results: [],
    activeIndex: -1,
    loading: false,
    timer: null
};

async function performGlobalSearch(query) {
    const value = query.trim();

    if (value.length < 2) {
        searchData.results = [];
        searchData.activeIndex = -1;
        return [];
    }

    searchData.loading = true;

    try {
        const response = await window.mediCoreAPI.get("/search", {
            params: { q: value }
        });

        searchData.results = response.data?.results || [];
        searchData.activeIndex = -1;

        return searchData.results;
    } catch (error) {
        console.error("Search failed:", error);
        searchData.results = [];
        return [];
    } finally {
        searchData.loading = false;
    }
}