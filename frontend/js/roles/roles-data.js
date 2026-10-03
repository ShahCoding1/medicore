const roleData = {
    roles: [],
    editingId: null,

    filters: {
        search: "",
        status: ""
    },

    summary: {
        total: 0,
        active: 0,
        inactive: 0,
        systemRoles: 0,
        customRoles: 0
    }
};

async function loadRoleSummary() {
    const response = await window.mediCoreAPI.get("/roles/summary");

    if (response.data?.success) {
        roleData.summary = response.data.data || roleData.summary;
    }

    return roleData.summary;
}

async function loadRoles() {
    const params = {};

    if (roleData.filters.search) {
        params.search = roleData.filters.search;
    }

    if (roleData.filters.status) {
        params.status = roleData.filters.status;
    }

    const response = await window.mediCoreAPI.get("/roles", {
        params
    });

    if (!response.data?.success) {
        throw new Error(
            response.data?.message || "Unable to load roles."
        );
    }

    roleData.roles = response.data.data || [];

    return roleData.roles;
}

async function loadRoleResources() {
    await Promise.all([
        loadRoleSummary(),
        loadRoles()
    ]);

    return {
        roles: roleData.roles,
        summary: roleData.summary
    };
}

async function createRole(payload) {
    const response = await window.mediCoreAPI.post(
        "/roles",
        payload
    );

    if (!response.data?.success) {
        throw new Error(
            response.data?.message || "Unable to create role."
        );
    }

    return response.data.data;
}

async function updateRole(id, payload) {
    const response = await window.mediCoreAPI.put(
        `/roles/${id}`,
        payload
    );

    if (!response.data?.success) {
        throw new Error(
            response.data?.message || "Unable to update role."
        );
    }

    return response.data.data;
}

async function deleteRole(id) {
    const response = await window.mediCoreAPI.delete(
        `/roles/${id}`
    );

    if (!response.data?.success) {
        throw new Error(
            response.data?.message || "Unable to delete role."
        );
    }

    return response.data;
}

function setRoleFilters(filters = {}) {
    roleData.filters = {
        ...roleData.filters,
        ...filters
    };
}

function clearRoleFilters() {
    roleData.filters = {
        search: "",
        status: ""
    };
}

function getRoleById(id) {
    return roleData.roles.find(
        (role) => String(role._id) === String(id)
    );
}

window.roleData = roleData;

window.roleDataAPI = {
    loadRoleSummary,
    loadRoles,
    loadRoleResources,
    createRole,
    updateRole,
    deleteRole,
    setRoleFilters,
    clearRoleFilters,
    getRoleById
};