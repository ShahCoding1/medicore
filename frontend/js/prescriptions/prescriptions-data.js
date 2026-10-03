/* =========================================================
   MEDICORE — PRESCRIPTIONS DATA LAYER
   Phase 11
   Handles all Prescription API communication.
   ========================================================= */

(function () {
    "use strict";

    const api = window.mediCoreAPI;

    if (!api) {
        console.error("MediCore API client is not available.");
        return;
    }

    const prescriptionData = {
        /**
         * Get all prescriptions.
         */
        async getPrescriptions(params = {}) {
            const response = await api.get("/prescriptions", {
                params
            });

            return response.data;
        },

        /**
         * Get a single prescription by ID.
         */
        async getPrescription(id) {
            if (!id) {
                throw new Error("Prescription ID is required.");
            }

            const response = await api.get(`/prescriptions/${id}`);

            return response.data;
        },

        /**
         * Create a prescription.
         */
        async createPrescription(payload) {
            const response = await api.post(
                "/prescriptions",
                payload
            );

            return response.data;
        },

        /**
         * Update a prescription.
         */
        async updatePrescription(id, payload) {
            if (!id) {
                throw new Error("Prescription ID is required.");
            }

            const response = await api.put(
                `/prescriptions/${id}`,
                payload
            );

            return response.data;
        },

        /**
         * Delete a prescription.
         */
        async deletePrescription(id) {
            if (!id) {
                throw new Error("Prescription ID is required.");
            }

            const response = await api.delete(
                `/prescriptions/${id}`
            );

            return response.data;
        },

        /**
         * Get patients for prescription form/filter dropdowns.
         *
         * Kept here rather than inside the UI layer so all
         * API communication remains centralized.
         */
        async getPatients(params = {}) {
            const response = await api.get("/patients", {
                params
            });

            return response.data;
        },

        /**
         * Get doctors for prescription form/filter dropdowns.
         */
        async getDoctors(params = {}) {
            const response = await api.get("/doctors", {
                params
            });

            return response.data;
        }
    };

    window.mediCorePrescriptionData = prescriptionData;
})();