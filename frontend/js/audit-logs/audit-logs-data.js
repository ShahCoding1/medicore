const auditLogsData = {
    logs: [],
    pagination: {
        page: 1,
        pages: 1,
        total: 0
    },

    filters: {
        user: "",
        module: "",
        action: "",
        status: "",
        from: "",
        to: "",
        search: ""
    }
};

const auditLogsAPI = {

    async loadLogs() {
        const params = new URLSearchParams();

        Object.entries(auditLogsData.filters).forEach(
            ([key, value]) => {
                if (value) {
                    params.set(key, value);
                }
            }
        );

        params.set(
            "page",
            auditLogsData.pagination.page
        );

        params.set("limit", "25");

        const response =
            await window.mediCoreAPI.get(
                `/audit-logs?${params.toString()}`
            );

        auditLogsData.logs =
            response.data.data || [];

        auditLogsData.pagination =
            response.data.pagination || {
                page: 1,
                pages: 1,
                total: 0
            };

        return auditLogsData;
    },

    async loadSummary() {
        const response =
            await window.mediCoreAPI.get(
                "/audit-logs/summary"
            );

        return response.data.data || {};
    },

    async getLog(id) {
        const response =
            await window.mediCoreAPI.get(
                `/audit-logs/${id}`
            );

        return response.data.data;
    }
};