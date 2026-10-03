const reportsData = {
    reports: [],

    filters: {
        category: "",
        status: "",
        search: ""
    },

    pagination: {
        page: 1,
        limit: 25,
        total: 0,
        pages: 0
    }
};

const reportsAPI = {
    async loadReports() {
        const params = new URLSearchParams();

        params.set("page", reportsData.pagination.page);
        params.set("limit", reportsData.pagination.limit);

        if (reportsData.filters.category) {
            params.set(
                "category",
                reportsData.filters.category
            );
        }

        if (reportsData.filters.status) {
            params.set(
                "status",
                reportsData.filters.status
            );
        }

        if (reportsData.filters.search) {
            params.set(
                "search",
                reportsData.filters.search
            );
        }

        const response = await window.mediCoreAPI.get(
            `/reports?${params.toString()}`
        );

        reportsData.reports =
            response.data.data || [];

        reportsData.pagination =
            response.data.pagination || reportsData.pagination;

        return reportsData;
    },

    async createReport(payload) {
        const response =
            await window.mediCoreAPI.post(
                "/reports",
                payload
            );

        return response.data.data;
    },

    async getReport(id) {
        const response =
            await window.mediCoreAPI.get(
                `/reports/${id}`
            );

        return response.data.data;
    },

    async deleteReport(id) {
        return window.mediCoreAPI.delete(
            `/reports/${id}`
        );
    }
};