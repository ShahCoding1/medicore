export async function getDepartments(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) {
        params.append(
            "search",
            filters.search
        );
    }

    if (filters.status) {
        params.append(
            "status",
            filters.status
        );
    }

    const queryString =
        params.toString();

    const response =
        await window.mediCoreAPI.get(
            queryString
                ? `/departments?${queryString}`
                : "/departments"
        );

    return response.data;
}

export async function getDepartment(id) {
    const response =
        await window.mediCoreAPI.get(
            `/departments/${id}`
        );

    return response.data;
}

export async function createDepartment(data) {
    const response =
        await window.mediCoreAPI.post(
            "/departments",
            data
        );

    return response.data;
}

export async function updateDepartment(
    id,
    data
) {
    const response =
        await window.mediCoreAPI.put(
            `/departments/${id}`,
            data
        );

    return response.data;
}

export async function deleteDepartment(id) {
    const response =
        await window.mediCoreAPI.delete(
            `/departments/${id}`
        );

    return response.data;
}