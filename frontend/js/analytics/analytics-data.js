const analyticsData = {
    filters: {
        range: "30d",
        gender: "",
        ageGroup: ""
    },
    data: null
};

async function loadAnalytics() {
    const response = await window.mediCoreAPI.get(
        "/analytics",
        { params: analyticsData.filters }
    );

    analyticsData.data = response.data.data;
    return analyticsData.data;
}

window.analyticsData = analyticsData;
window.analyticsDataAPI = { loadAnalytics };