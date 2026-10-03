const staffData = {
    staff: [],
    departments: [],
    editingId: null,

    filters: {
        search: "",
        role: "",
        department: "",
        status: ""
    },

    summary: {
        total: 0,
        active: 0,
        inactive: 0,
        onLeave: 0,
        suspended: 0
    },

    async loadSummary() {
        const response = await window.mediCoreAPI.get("/staff/summary");

        const data = response.data?.data || response.data || {};

        this.summary = {
            total: Number(data.total || 0),
            active: Number(data.active || 0),
            inactive: Number(data.inactive || 0),
            onLeave: Number(data.onLeave || 0),
            suspended: Number(data.suspended || 0)
        };

        return this.summary;
    },

    async loadStaff() {
        const params = {};

        if (this.filters.search) {
            params.search = this.filters.search;
        }

        if (this.filters.role) {
            params.role = this.filters.role;
        }

        if (this.filters.department) {
            params.department = this.filters.department;
        }

        if (this.filters.status) {
            params.status = this.filters.status;
        }

        const response = await window.mediCoreAPI.get("/staff", {
            params
        });

        const payload = response.data?.data || response.data || {};

        this.staff = Array.isArray(payload)
            ? payload
            : payload.staff || payload.results || [];

        return this.staff;
    },

    async loadDepartments() {
        const response = await window.mediCoreAPI.get("/departments");

        const payload = response.data?.data || response.data || {};

        this.departments = Array.isArray(payload)
            ? payload
            : payload.departments || payload.results || [];

        return this.departments;
    },

    async loadResources() {
        await Promise.all([
            this.loadDepartments(),
            this.loadSummary(),
            this.loadStaff()
        ]);
    },

    async refresh() {
        await Promise.all([
            this.loadSummary(),
            this.loadStaff()
        ]);

        return this.staff;
    },

    async createStaff(payload) {
        const response = await window.mediCoreAPI.post(
            "/staff",
            payload
        );

        return response.data;
    },

    async updateStaff(id, payload) {
        const response = await window.mediCoreAPI.put(
            `/staff/${id}`,
            payload
        );

        return response.data;
    },

    async deleteStaff(id) {
        const response = await window.mediCoreAPI.delete(
            `/staff/${id}`
        );

        return response.data;
    },

    setFilters(filters) {
        this.filters = {
            ...this.filters,
            ...filters
        };
    },

    clearFilters() {
        this.filters = {
            search: "",
            role: "",
            department: "",
            status: ""
        };
    },

    getStaffById(id) {
        return this.staff.find(
            (member) => String(member._id) === String(id)
        );
    },

    getRoles() {
        return [
            ...new Set(
                this.staff
                    .map((member) => member.role)
                    .filter(Boolean)
                    .map((role) => String(role).trim())
            )
        ].sort((a, b) => a.localeCompare(b));
    }
};

window.staffData = staffData;