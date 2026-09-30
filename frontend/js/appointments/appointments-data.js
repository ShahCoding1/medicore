// ==========================================
// APPOINTMENT API
// ==========================================

async function getAppointments(filters = {}) {
    const response =
        await window.mediCoreAPI.get(
            "/appointments",
            {
                params: filters
            }
        );

    return response.data;
}

// ==========================================
// GET SINGLE APPOINTMENT
// ==========================================

async function getAppointment(id) {
    const response =
        await window.mediCoreAPI.get(
            `/appointments/${id}`
        );

    return response.data;
}

// ==========================================
// CREATE APPOINTMENT
// ==========================================

async function createAppointment(data) {
    const response =
        await window.mediCoreAPI.post(
            "/appointments",
            data
        );

    return response.data;
}

// ==========================================
// UPDATE APPOINTMENT
// ==========================================

async function updateAppointment(
    id,
    data
) {
    const response =
        await window.mediCoreAPI.put(
            `/appointments/${id}`,
            data
        );

    return response.data;
}

// ==========================================
// DELETE APPOINTMENT
// ==========================================

async function deleteAppointment(id) {
    const response =
        await window.mediCoreAPI.delete(
            `/appointments/${id}`
        );

    return response.data;
}

// ==========================================
// EXPORTS
// ==========================================

export {
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment
};