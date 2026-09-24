import { initDashboardUI } from "./dashboard/dashboard-ui.js";
import {
    initDashboardCharts,
    renderPatientGrowthChart,
    renderRevenueChart
} from "./dashboard/dashboard-charts.js";
import { loadDashboardOverview } from "./dashboard/dashboard-data.js";
import { initDashboardShell } from "./dashboard/dashboard-shell.js";

async function initDashboard() {
    if (!window.mediCoreAuth?.requireAuth()) {
        return;
    }

    initDashboardUI();
    initDashboardCharts();
    initDashboardShell();

    await loadDashboardOverview({
        renderPatientGrowthChart,
        renderRevenueChart
    });
}

document.addEventListener("DOMContentLoaded", initDashboard);