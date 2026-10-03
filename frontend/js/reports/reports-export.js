const reportsExport = {
    async exportCSV(report) {
        if (!report) {
            throw new Error(
                "Report could not be found."
            );
        }

        if (report.status !== "ready") {
            throw new Error(
                "Only ready reports can be exported."
            );
        }

        const rows =
            report.result?.rows || [];

        if (!rows.length) {
            throw new Error(
                "This report contains no generated rows to export."
            );
        }

        const headers =
            Object.keys(rows[0]);

        const csvRows = [
            headers.join(","),
            ...rows.map((row) =>
                headers
                    .map((header) => {
                        const value =
                            String(
                                row[header] ?? ""
                            )
                                .replaceAll(
                                    '"',
                                    '""'
                                );

                        return `"${value}"`;
                    })
                    .join(",")
            )
        ];

        const csv =
            csvRows.join("\n");

        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `${report.name || "medicore-report"}.csv`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

        return true;
    },

    print(report) {
        if (!report) {
            throw new Error(
                "Report could not be found."
            );
        }

        if (report.status !== "ready") {
            throw new Error(
                "Only ready reports can be printed."
            );
        }

        window.print();
    },

    exportExcel() {
        throw new Error(
            "Excel export is not implemented yet."
        );
    },

    exportPDF() {
        throw new Error(
            "PDF export is not implemented yet."
        );
    }
};