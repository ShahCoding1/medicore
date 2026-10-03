/* =========================================================
   MEDICORE — PHARMACY DATA LAYER
   Phase 12 — Pharmacy Inventory
   ========================================================= */

(function () {
    "use strict";

    const api = window.mediCoreAPI;

    if (!api) {
        console.error(
            "MediCore API client is not available."
        );
        return;
    }


    /* =====================================================
       RESPONSE HELPERS
       ===================================================== */

    function extractArray(response, preferredKeys = []) {
        if (Array.isArray(response)) {
            return response;
        }

        if (!response || typeof response !== "object") {
            return [];
        }

        for (const key of preferredKeys) {
            if (Array.isArray(response[key])) {
                return response[key];
            }
        }

        if (response.data) {
            if (Array.isArray(response.data)) {
                return response.data;
            }

            if (
                typeof response.data === "object"
            ) {
                for (const key of preferredKeys) {
                    if (
                        Array.isArray(
                            response.data[key]
                        )
                    ) {
                        return response.data[key];
                    }
                }
            }
        }

        if (Array.isArray(response.results)) {
            return response.results;
        }

        return [];
    }


    function getResponseData(response) {
        if (
            response &&
            typeof response === "object" &&
            Object.prototype.hasOwnProperty.call(
                response,
                "data"
            )
        ) {
            return response.data;
        }

        return response;
    }


    /* =====================================================
       PHARMACY API
       ===================================================== */

    const pharmacyData = {


        /* ================================================
           GET ALL INVENTORY
           ================================================ */

        async getInventory(params = {}) {

            const response = await api.get(
                "/pharmacy/inventory",
                {
                    params
                }
            );

            return response.data;
        },


        /* ================================================
           GET SINGLE INVENTORY RECORD
           ================================================ */

        async getInventoryItem(id) {

            if (!id) {
                throw new Error(
                    "Inventory ID is required."
                );
            }

            const response = await api.get(
                `/pharmacy/inventory/${id}`
            );

            return response.data;
        },


        /* ================================================
           CREATE INVENTORY RECORD
           ================================================ */

        async createInventory(payload) {

            if (
                !payload ||
                typeof payload !== "object"
            ) {
                throw new Error(
                    "Inventory data is required."
                );
            }

            const response = await api.post(
                "/pharmacy/inventory",
                payload
            );

            return response.data;
        },


        /* ================================================
           UPDATE INVENTORY RECORD
           ================================================ */

        async updateInventory(
            id,
            payload
        ) {

            if (!id) {
                throw new Error(
                    "Inventory ID is required."
                );
            }

            if (
                !payload ||
                typeof payload !== "object"
            ) {
                throw new Error(
                    "Inventory data is required."
                );
            }

            const response = await api.put(
                `/pharmacy/inventory/${id}`,
                payload
            );

            return response.data;
        },


        /* ================================================
           DELETE INVENTORY RECORD
           ================================================ */

        async deleteInventory(id) {

            if (!id) {
                throw new Error(
                    "Inventory ID is required."
                );
            }

            const response = await api.delete(
                `/pharmacy/inventory/${id}`
            );

            return response.data;
        },


        /* ================================================
           GET LOW-STOCK INVENTORY
           ================================================ */

        async getLowStockInventory() {

            const response = await api.get(
                "/pharmacy/inventory",
                {
                    params: {
                        lowStock: true
                    }
                }
            );

            return response.data;
        },


        /* ================================================
           GET EXPIRING INVENTORY
           ================================================ */

        async getExpiringInventory() {

            const response = await api.get(
                "/pharmacy/inventory",
                {
                    params: {
                        expiringSoon: true
                    }
                }
            );

            return response.data;
        },


        /* ================================================
           GET INVENTORY CATEGORIES
           ================================================ */

        async getCategories() {

            const response = await api.get(
                "/pharmacy/inventory/categories"
            );

            return response.data;
        },


        /* ================================================
           NORMALIZED INVENTORY LIST
           ================================================ */

        async getInventoryList(
            params = {}
        ) {

            const response =
                await this.getInventory(params);

            return extractArray(
                response,
                [
                    "inventory",
                    "items",
                    "medicines",
                    "records"
                ]
            );
        },


        /* ================================================
           NORMALIZED CATEGORIES
           ================================================ */

        async getCategoryList() {

            try {

                const response =
                    await this.getCategories();

                return extractArray(
                    response,
                    [
                        "categories",
                        "items"
                    ]
                );

            } catch (error) {

                /*
                 * Category endpoint is optional for the
                 * frontend. If it does not exist yet,
                 * the controller can build categories
                 * directly from loaded inventory.
                 */

                console.warn(
                    "Unable to load pharmacy categories:",
                    error
                );

                return [];
            }
        },


        /* ================================================
           RESPONSE HELPERS
           ================================================ */

        extractArray,

        getResponseData

    };


    /* =====================================================
       GLOBAL EXPORT
       ===================================================== */

    window.mediCorePharmacyData =
        pharmacyData;

})();