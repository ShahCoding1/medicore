import {
    renderDashboardKPIs,
    renderRecentPatients,
    renderAppointmentTimeline
} from "./dashboard-ui.js";

export async function loadDashboardOverview({
    renderPatientGrowthChart,
    renderRevenueChart
}) {
    try {
        const response =
            await window.mediCoreAPI.get(
                "/dashboard/overview"
            );

        if (!response.data?.success) {
            return;
        }

        const data = response.data.data || {};

        renderPatientGrowthChart(
            data.patientGrowth || []
        );

        renderRevenueChart(
            data.revenueHistory || []
        );

        renderDashboardKPIs(data);

        renderRecentPatients(
            data.recentPatients || []
        );

        renderAppointmentTimeline(
            data.todayAppointments || []
        );

    } catch (error) {
        console.error(
            "Dashboard API error:",
            error
        );
    }
}