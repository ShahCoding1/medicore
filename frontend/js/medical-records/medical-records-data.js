// =========================================================
// MEDICORE — MEDICAL RECORDS DATA LAYER
// Phase 10
// =========================================================

// =========================================================
// GET MEDICAL RECORDS
// =========================================================

async function getMedicalRecords(filters = {}) {
    const response =
        await window.mediCoreAPI.get(
            "/medical-records",
            {
                params: filters
            }
        );

    return response.data;
}


// =========================================================
// GET SINGLE MEDICAL RECORD
// =========================================================

async function getMedicalRecord(id) {
    if (!id) {
        throw new Error(
            "Medical record ID is required."
        );
    }

    const response =
        await window.mediCoreAPI.get(
            `/medical-records/${id}`
        );

    return response.data;
}


// =========================================================
// CREATE MEDICAL RECORD
// =========================================================

async function createMedicalRecord(data) {
    const response =
        await window.mediCoreAPI.post(
            "/medical-records",
            data
        );

    return response.data;
}


// =========================================================
// UPDATE MEDICAL RECORD
// =========================================================

async function updateMedicalRecord(
    id,
    data
) {
    if (!id) {
        throw new Error(
            "Medical record ID is required."
        );
    }

    const response =
        await window.mediCoreAPI.put(
            `/medical-records/${id}`,
            data
        );

    return response.data;
}


// =========================================================
// DELETE MEDICAL RECORD
// =========================================================

async function deleteMedicalRecord(id) {
    if (!id) {
        throw new Error(
            "Medical record ID is required."
        );
    }

    const response =
        await window.mediCoreAPI.delete(
            `/medical-records/${id}`
        );

    return response.data;
}


// =========================================================
// GET PATIENTS
// =========================================================

async function getPatients() {
    const response =
        await window.mediCoreAPI.get(
            "/patients",
            {
                params: {
                    status: "active"
                }
            }
        );

    return response.data;
}


// =========================================================
// GET DOCTORS
// =========================================================

async function getDoctors() {
    const response =
        await window.mediCoreAPI.get(
            "/doctors",
            {
                params: {
                    status: "active"
                }
            }
        );

    return response.data;
}


// =========================================================
// EXPORTS
// =========================================================

export {
    getMedicalRecords,
    getMedicalRecord,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getPatients,
    getDoctors
};