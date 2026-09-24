let patientGrowthChart = null;
let revenueChart = null;

export function initDashboardCharts() {
    if (typeof Chart === "undefined") {
        console.error(
            "Chart.js is not available."
        );
    }
}

export function renderPatientGrowthChart(
    data = []
) {
    const canvas =
        document.getElementById(
            "patientGrowthChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const labels =
        data.map(item => item._id);

    const values =
        data.map(item => item.total);

    if (patientGrowthChart) {
        patientGrowthChart.destroy();
    }

    patientGrowthChart = new Chart(canvas, {
        type: "line",

        data: {
            labels,

            datasets: [
                {
                    label: "Patients",
                    data: values,
                    tension: 0.35,
                    fill: true
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

export function renderRevenueChart(
    data = []
) {
    const canvas =
        document.getElementById(
            "revenueChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const labels =
        data.map(item => item._id);

    const values =
        data.map(item => item.total);

    if (revenueChart) {
        revenueChart.destroy();
    }

    revenueChart = new Chart(canvas, {
        type: "bar",

        data: {
            labels,

            datasets: [
                {
                    label: "Revenue",
                    data: values
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}