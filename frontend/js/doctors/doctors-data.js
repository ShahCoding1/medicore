export async function getDoctors(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) {
        params.append("search", filters.search);
    }

    if (filters.status) {
        params.append("status", filters.status);
    }

    if (filters.department) {
        params.append("department", filters.department);
    }

    const response = await window.mediCoreAPI.get(
        `/doctors?${params.toString()}`
    );

    return response.data;
}


export async function getDoctor(id) {
    const response = await window.mediCoreAPI.get(
        `/doctors/${id}`
    );

    return response.data;
}


export async function createDoctor(data) {
    const response = await window.mediCoreAPI.post(
        "/doctors",
        data
    );

    return response.data;
}


export async function updateDoctor(id, data) {
    const response = await window.mediCoreAPI.put(
        `/doctors/${id}`,
        data
    );

    return response.data;
}


export async function deleteDoctor(id) {
    const response = await window.mediCoreAPI.delete(
        `/doctors/${id}`
    );

    return response.data;
}