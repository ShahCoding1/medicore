const API_BASE = "/admissions";

const getAdmissions = async (params = {}) => {
    const response = await window.mediCoreAPI.get(
        API_BASE,
        { params }
    );

    return response.data?.data || [];
};

const getAdmission = async (id) => {
    const response = await window.mediCoreAPI.get(
        `${API_BASE}/${id}`
    );

    return response.data?.data;
};

const createAdmission = async (payload) => {
    const response = await window.mediCoreAPI.post(
        API_BASE,
        payload
    );

    return response.data?.data;
};

const updateAdmission = async (id, payload) => {
    const response = await window.mediCoreAPI.put(
        `${API_BASE}/${id}`,
        payload
    );

    return response.data?.data;
};

const deleteAdmission = async (id) => {
    const response = await window.mediCoreAPI.delete(
        `${API_BASE}/${id}`
    );

    return response.data;
};

const getAdmissionSummary = async () => {
    const response = await window.mediCoreAPI.get(
        `${API_BASE}/summary`
    );

    return response.data?.data || {};
};

const getPatients = async () => {
    const response = await window.mediCoreAPI.get(
        "/patients"
    );

    return response.data?.data || [];
};

const getDoctors = async () => {
    const response = await window.mediCoreAPI.get(
        "/doctors"
    );

    return response.data?.data || [];
};

const getDepartments = async () => {
    const response = await window.mediCoreAPI.get(
        "/departments"
    );

    return response.data?.data || [];
};

const getErrorMessage = (error) => {
    return (
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again."
    );
};

const getPatientName = (patient) => {
    if (!patient) return "—";

    const name = [
        patient.firstName,
        patient.lastName
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return name || "Unknown Patient";
};

const getDoctorName = (doctor) => {
    if (!doctor) return "—";

    const name = [
        doctor.firstName,
        doctor.lastName
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return name
        ? `Dr. ${name}`
        : "Unknown Doctor";
};

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};

const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
};

const toDateTimeLocalValue = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const pad = (number) =>
        String(number).padStart(2, "0");

    return (
        `${date.getFullYear()}-` +
        `${pad(date.getMonth() + 1)}-` +
        `${pad(date.getDate())}T` +
        `${pad(date.getHours())}:` +
        `${pad(date.getMinutes())}`
    );
};

const getStatusLabel = (status) => {
    const labels = {
        admitted: "Admitted",
        observation: "Observation",
        discharged: "Discharged",
        transferred: "Transferred",
        cancelled: "Cancelled"
    };

    return labels[status] || status || "Unknown";
};

const getPriorityLabel = (priority) => {
    const labels = {
        low: "Low",
        normal: "Normal",
        high: "High",
        critical: "Critical"
    };

    return labels[priority] || priority || "Normal";
};

const getAdmissionTypeLabel = (type) => {
    const labels = {
        emergency: "Emergency",
        routine: "Routine",
        referral: "Referral",
        transfer: "Transfer"
    };

    return labels[type] || type || "Routine";
};

const escapeHtml = (value) => {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};

const normalizeAdmission = (admission) => {
    return {
        ...admission,
        patient: admission?.patient || null,
        attendingDoctor:
            admission?.attendingDoctor || null,
        department:
            admission?.department || null
    };
};

window.mediCoreAdmissionsData = {
    getAdmissions,
    getAdmission,
    createAdmission,
    updateAdmission,
    deleteAdmission,
    getAdmissionSummary,
    getPatients,
    getDoctors,
    getDepartments,
    getErrorMessage,
    getPatientName,
    getDoctorName,
    formatDate,
    formatDateTime,
    toDateTimeLocalValue,
    getStatusLabel,
    getPriorityLabel,
    getAdmissionTypeLabel,
    escapeHtml,
    normalizeAdmission
};