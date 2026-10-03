/* =========================================================
   MEDICORE — LABORATORY DATA LAYER
   Phase 13 — Laboratory Tests
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

    function extractArray(
        response,
        preferredKeys = []
    ) {
        if (Array.isArray(response)) {
            return response;
        }

        if (
            !response ||
            typeof response !== "object"
        ) {
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

    const laboratoryData = {

        /*
        |--------------------------------------------------------------------------
        | Get laboratory tests
        |--------------------------------------------------------------------------
        */

        async getLabTests(params = {}) {
            const response = await api.get(
                "/laboratory/tests",
                {
                    params
                }
            );

            return response.data;
        },

        /*
        |--------------------------------------------------------------------------
        | Get one laboratory test
        |--------------------------------------------------------------------------
        */

        async getLabTest(id) {
            if (!id) {
                throw new Error(
                    "Laboratory test ID is required."
                );
            }

            const response = await api.get(
                `/laboratory/tests/${id}`
            );

            return response.data;
        },

        /*
        |--------------------------------------------------------------------------
        | Create laboratory test
        |--------------------------------------------------------------------------
        */

        async createLabTest(payload) {
            if (
                !payload ||
                typeof payload !== "object"
            ) {
                throw new Error(
                    "Laboratory test data is required."
                );
            }

            const response = await api.post(
                "/laboratory/tests",
                payload
            );

            return response.data;
        },

        /*
        |--------------------------------------------------------------------------
        | Update laboratory test
        |--------------------------------------------------------------------------
        */

        async updateLabTest(id, payload) {
            if (!id) {
                throw new Error(
                    "Laboratory test ID is required."
                );
            }

            if (
                !payload ||
                typeof payload !== "object"
            ) {
                throw new Error(
                    "Laboratory test data is required."
                );
            }

            const response = await api.put(
                `/laboratory/tests/${id}`,
                payload
            );

            return response.data;
        },

        /*
        |--------------------------------------------------------------------------
        | Delete laboratory test
        |--------------------------------------------------------------------------
        */

        async deleteLabTest(id) {
            if (!id) {
                throw new Error(
                    "Laboratory test ID is required."
                );
            }

            const response = await api.delete(
                `/laboratory/tests/${id}`
            );

            return response.data;
        },

        /*
        |--------------------------------------------------------------------------
        | Get categories
        |--------------------------------------------------------------------------
        */

        async getCategories() {
            const response = await api.get(
                "/laboratory/tests/categories"
            );

            return response.data;
        },

        /*
        |--------------------------------------------------------------------------
        | Get normalized test list
        |--------------------------------------------------------------------------
        */

        async getLabTestList(params = {}) {
            const response =
                await this.getLabTests(params);

            return extractArray(
                response,
                [
                    "tests",
                    "labTests",
                    "laboratoryTests",
                    "items",
                    "records"
                ]
            );
        },

        /*
        |--------------------------------------------------------------------------
        | Get normalized category list
        |--------------------------------------------------------------------------
        */

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
                console.warn(
                    "Unable to load laboratory categories:",
                    error
                );

                return [];
            }
        },

        extractArray,

        getResponseData
    };

    window.mediCoreLaboratoryData =
        laboratoryData;
})();