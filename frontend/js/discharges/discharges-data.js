const dischargesData = {
    discharges: [],
    patients: [],
    admissions: [],
    doctors: [],
    editingId: null,

    filters: {
        search: "",
        patient: "",
        doctor: "",
        dateFrom: "",
        dateTo: ""
    },

    summary: {
        total: 0,
        today: 0,
        thisMonth: 0
    }
};

async function loadDischargeSummary() {
    const response = await window.mediCoreAPI.get("/discharges/summary");

    dischargesData.summary = response.data?.data || {
        total: 0,
        today: 0,
        thisMonth: 0
    };

    return dischargesData.summary;
}

async function loadDischarges() {
    const params = {};

    if (dischargesData.filters.search) {
        params.search = dischargesData.filters.search;
    }

    if (dischargesData.filters.patient) {
        params.patient = dischargesData.filters.patient;
    }

    if (dischargesData.filters.doctor) {
        params.doctor = dischargesData.filters.doctor;
    }

    if (dischargesData.filters.dateFrom) {
        params.dateFrom = dischargesData.filters.dateFrom;
    }

    if (dischargesData.filters.dateTo) {
        params.dateTo = dischargesData.filters.dateTo;
    }

    params.limit = 100;

    const response = await window.mediCoreAPI.get("/discharges", {
        params
    });

    dischargesData.discharges = response.data?.data || [];

    return dischargesData.discharges;
}

async function loadPatients() {
    const response = await window.mediCoreAPI.get("/patients", {
        params: {
            limit: 1000
        }
    });

    dischargesData.patients = response.data?.data || [];

    return dischargesData.patients;
}

async function loadAdmissions() {
    const response = await window.mediCoreAPI.get("/admissions", {
        params: {
            status: "admitted",
            limit: 1000
        }
    });

    dischargesData.admissions = response.data?.data || [];

    return dischargesData.admissions;
}

async function loadDoctors() {
    const response = await window.mediCoreAPI.get("/doctors", {
        params: {
            limit: 1000
        }
    });

    dischargesData.doctors = response.data?.data || [];

    return dischargesData.doctors;
}

async function loadDischargeResources() {
    const results = await Promise.all([
        loadPatients(),
        loadAdmissions(),
        loadDoctors()
    ]);

    return results;
}

async function refreshDischargeData() {
    await Promise.all([
        loadDischargeSummary(),
        loadDischarges()
    ]);

    return {
        discharges: dischargesData.discharges,
        summary: dischargesData.summary
    };
}

async function getDischargeById(id) {
    const response = await window.mediCoreAPI.get(`/discharges/${id}`);

    return response.data?.data || null;
}

async function createDischarge(payload) {
    const response = await window.mediCoreAPI.post(
        "/discharges",
        payload
    );

    return response.data?.data || null;
}

async function updateDischarge(id, payload) {
    const response = await window.mediCoreAPI.put(
        `/discharges/${id}`,
        payload
    );

    return response.data?.data || null;
}

async function deleteDischarge(id) {
    const response = await window.mediCoreAPI.delete(
        `/discharges/${id}`
    );

    return response.data;
}

function setDischargeFilters(filters = {}) {
    dischargesData.filters = {
        ...dischargesData.filters,
        ...filters
    };
}

function clearDischargeFiltersState() {
    dischargesData.filters = {
        search: "",
        patient: "",
        doctor: "",
        dateFrom: "",
        dateTo: ""
    };
}

window.dischargesData = dischargesData;

window.loadDischargeSummary = loadDischargeSummary;
window.loadDischarges = loadDischarges;
window.loadPatientsForDischarges = loadPatients;
window.loadAdmissionsForDischarges = loadAdmissions;
window.loadDoctorsForDischarges = loadDoctors;
window.loadDischargeResources = loadDischargeResources;
window.refreshDischargeData = refreshDischargeData;
window.getDischargeById = getDischargeById;
window.createDischarge = createDischarge;
window.updateDischarge = updateDischarge;
window.deleteDischarge = deleteDischarge;
window.setDischargeFilters = setDischargeFilters;
window.clearDischargeFiltersState = clearDischargeFiltersState;