document.addEventListener("DOMContentLoaded", async () => {

    const range = document.getElementById("rangeFilter");
    const gender = document.getElementById("genderFilter");
    const age = document.getElementById("ageFilter");
    const apply = document.getElementById("applyFilters");

    async function refresh() {
        try {
            analyticsData.filters.range = range.value;
            analyticsData.filters.gender = gender.value;
            analyticsData.filters.ageGroup = age.value;

            const data =
                await analyticsDataAPI.loadAnalytics();

            analyticsUI.render(data);
        } catch (error) {
            console.error("Analytics load failed:", error);
        }
    }

    apply.addEventListener("click", refresh);
