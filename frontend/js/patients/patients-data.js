export async function getPatients(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) {
        params.set(
            "search",
            filters.search
        );
    }

    if (filters.status) {
        params.set(
            "status",
            filters.status
        );
    }

    if (filters.department) {
        params.set(
            "department",
            filters.department
        );
    }

    const response =
        await window.mediCoreAPI.get(
            `/patients?${params.toString()}`
        );

    return response.data?.data || [];
}

export async function getPatient(id) {
    const response =
        await window.mediCoreAPI.get(
            `/patients/${id}`
        );

    return response.data?.data;
}

export async function createPatient(data) {
    const response =
        await window.mediCoreAPI.post(
            "/patients",
            data
        );

    return response.data;
}

export async function updatePatient(
    id,
    data
) {
    const response =
        await window.mediCoreAPI.put(
            `/patients/${id}`,
            data
        );

    return response.data;
}

export async function deletePatient(id) {
    const response =
        await window.mediCoreAPI.delete(
            `/patients/${id}`
        );

    return response.data;
}