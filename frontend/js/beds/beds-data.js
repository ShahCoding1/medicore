const bedsData = {
    beds: [],
    patients: [],
    admissions: [],
    editingId: null,

    filters: {
        search: "",
        status: "",
        bedType: "",
        ward: "",
        floor: ""
    },

    summary: {
        total: 0,
        available: 0,
        occupied: 0,
        reserved: 0,
        maintenance: 0,
        blocked: 0
    }
};


async function loadBedSummary() {
    const response = await window.mediCoreAPI.get("/beds/summary");

    if (response.data?.success) {
        bedsData.summary = response.data.data || {};

        return bedsData.summary;
    }

    throw new Error(
        response.data?.message || "Unable to load bed summary."
    );
}


async function loadBeds() {
    const params = {};

    if (bedsData.filters.status) {
        params.status = bedsData.filters.status;
    }

    if (bedsData.filters.bedType) {
        params.bedType = bedsData.filters.bedType;
    }

    if (bedsData.filters.ward) {
        params.ward = bedsData.filters.ward;
    }

    if (bedsData.filters.floor) {
        params.floor = bedsData.filters.floor;
    }

    if (bedsData.filters.search) {
        params.search = bedsData.filters.search;
    }

    const response = await window.mediCoreAPI.get("/beds", {
        params
    });

    if (response.data?.success) {
        bedsData.beds = response.data.data || [];

        return bedsData.beds;
    }

    throw new Error(
        response.data?.message || "Unable to load beds."
    );
}


async function loadPatients() {
    const response = await window.mediCoreAPI.get("/patients", {
        params: {
            limit: 1000
        }
    });

    if (response.data?.success) {
        bedsData.patients =
            response.data.data ||
            response.data.patients ||
            [];

        return bedsData.patients;
    }

    throw new Error(
        response.data?.message || "Unable to load patients."
    );
}


async function loadAdmissions() {
    const response = await window.mediCoreAPI.get("/admissions", {
        params: {
            status: "admitted"
        }
    });

    if (response.data?.success) {
        bedsData.admissions =
            response.data.data ||
            response.data.admissions ||
            [];

        return bedsData.admissions;
    }

    throw new Error(
        response.data?.message || "Unable to load admissions."
    );
}


async function loadBedResources() {
    await Promise.all([
        loadPatients(),
        loadAdmissions()
    ]);
}


async function createBed(payload) {
    const response = await window.mediCoreAPI.post(
        "/beds",
        payload
    );

    if (response.data?.success) {
        return response.data.data;
    }

    throw new Error(
        response.data?.message || "Unable to create bed."
    );
}


async function updateBed(id, payload) {
    const response = await window.mediCoreAPI.put(
        `/beds/${id}`,
        payload
    );

    if (response.data?.success) {
        return response.data.data;
    }

    throw new Error(
        response.data?.message || "Unable to update bed."
    );
}


async function deleteBed(id) {
    const response = await window.mediCoreAPI.delete(
        `/beds/${id}`
    );

    if (response.data?.success) {
        return true;
    }

    throw new Error(
        response.data?.message || "Unable to delete bed."
    );
}


async function assignBed(id, patient, admission = null) {
    const payload = {
        patient
    };

    if (admission) {
        payload.admission = admission;
    }

    const response = await window.mediCoreAPI.put(
        `/beds/${id}/assign`,
        payload
    );

    if (response.data?.success) {
        return response.data.data;
    }

    throw new Error(
        response.data?.message || "Unable to assign bed."
    );
}


async function releaseBed(id) {
    const response = await window.mediCoreAPI.put(
        `/beds/${id}/release`
    );

    if (response.data?.success) {
        return response.data.data;
    }

    throw new Error(
        response.data?.message || "Unable to release bed."
    );
}


async function getBed(id) {
    const response = await window.mediCoreAPI.get(
        `/beds/${id}`
    );

    if (response.data?.success) {
        return response.data.data;
    }

    throw new Error(
        response.data?.message || "Unable to load bed."
    );
}