function metricCard(label, value) {
    return `
        <div class="analytics-metric">
            <span>${label}</span>
            <strong>${value}</strong>
        </div>
    `;
}

const analyticsUI = {

    render(data) {
        const p = data.patients;
        const f = data.financial;
        const c = data.clinical;
        const o = data.operational;

        document.getElementById("analyticsKpis").innerHTML = `
            <div class="analytics-kpi">
                <span>New Patients</span>
                <strong>${p.newPatients}</strong>
            </div>
            <div class="analytics-kpi">
                <span>Appointments</span>
                <strong>${p.appointments}</strong>
            </div>
            <div class="analytics-kpi">
                <span>Revenue</span>
                <strong>${f.revenue.toLocaleString()}</strong>
            </div>
            <div class="analytics-kpi">
                <span>Bed Occupancy</span>
                <strong>${o.bedOccupancy}%</strong>
            </div>
        `;

        document.getElementById("patientMetrics").innerHTML = [
            ["New Patients", p.newPatients],
            ["Returning Patients", p.returningPatients],
            ["Active Patients", p.activePatients],
            ["Admissions", p.admissions],
            ["Discharges", p.discharges],
            ["Appointments", p.appointments],
            ["No-shows", p.noShows]
        ].map(x => metricCard(...x)).join("");

        document.getElementById("financialMetrics").innerHTML = [
            ["Revenue", f.revenue.toLocaleString()],
            ["Collections", f.collections.toLocaleString()],
            ["Outstanding", f.outstanding.toLocaleString()],
            ["Refunds", f.refunds.toLocaleString()]
        ].map(x => metricCard(...x)).join("");

        document.getElementById("clinicalMetrics").innerHTML = [
            ["Diagnoses", c.diagnoses],
            ["Lab Volume", c.labVolume],
            ["Prescriptions", c.prescriptions],
            ["Patient Demographics", c.patientDemographics],
            ["Department Workload", c.departmentWorkload],
            ["Doctor Workload", c.doctorWorkload]
        ].map(x => metricCard(...x)).join("");

        document.getElementById("operationalMetrics").innerHTML = [
            ["Bed Occupancy", `${o.bedOccupancy}%`],
            ["Average Waiting Time", o.averageWaitingTime],
            ["Appointment Utilization", `${o.appointmentUtilization}%`],
            ["Doctor Utilization", `${o.doctorUtilization}%`],
            ["Department Capacity", o.departmentCapacity]
        ].map(x => metricCard(...x)).join("");
    }
};

window.analyticsUI = analyticsUI;