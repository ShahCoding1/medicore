require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Hospital = require("./models/Hospital");
const Patient = require("./models/Patient");
const Appointment = require("./models/Appointment");
const Invoice = require("./models/Invoice");

async function seedDashboard() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({
            isActive: true
        });

        if (!user) {
            throw new Error("No active user found.");
        }

        let hospital = await Hospital.findOne({
            owner: user._id
        });

        if (!hospital) {
            hospital = await Hospital.create({
                owner: user._id,
                name: "MediCore General Hospital",
                type: "general",
                registrationNumber: "MC-REG-001",
                country: "Pakistan",
                city: "Peshawar",
                address: "MediCore Healthcare Campus",
                phone: "0910000000",
                email: user.email,
                website: "",
                onboardingCompleted: true
            });

            console.log(
                "Hospital created for existing user."
            );
        }

        let doctor = await User.findOne({
            role: "doctor",
            isActive: true
        });

        if (!doctor) {
            const password = await bcrypt.hash(
                "Doctor@123",
                12
            );

            doctor = await User.create({
                name: "Dr. Ahmed Khan",
                email: `doctor-${Date.now()}@medicore.test`,
                password,
                role: "doctor",
                phone: "03001234567",
                isActive: true
            });
        }

        await Patient.deleteMany({
            hospital: hospital._id
        });

        await Appointment.deleteMany({
            hospital: hospital._id
        });

        await Invoice.deleteMany({
            hospital: hospital._id
        });

        const patients = await Patient.insertMany([
            {
                hospital: hospital._id,
                patientId: "MC-10001",
                firstName: "Ahmed",
                lastName: "Khan",
                phone: "03001234567",
                gender: "male",
                status: "active"
            },
            {
                hospital: hospital._id,
                patientId: "MC-10002",
                firstName: "Fatima",
                lastName: "Noor",
                phone: "03001234568",
                gender: "female",
                status: "active"
            },
            {
                hospital: hospital._id,
                patientId: "MC-10003",
                firstName: "Usman",
                lastName: "Khan",
                phone: "03001234569",
                gender: "male",
                status: "active"
            },
            {
                hospital: hospital._id,
                patientId: "MC-10004",
                firstName: "Ayesha",
                lastName: "Malik",
                phone: "03001234570",
                gender: "female",
                status: "active"
            }
        ]);

        await Appointment.insertMany(
            patients.map((patient, index) => ({
                hospital: hospital._id,
                patient: patient._id,
                doctor: doctor._id,
                appointmentDate:
                    new Date(
                        Date.now() +
                        (index + 1) * 3600000
                    ),
                reason: "General consultation",
                status: "scheduled"
            }))
        );

        await Invoice.insertMany(
            patients.map((patient, index) => ({
                hospital: hospital._id,
                patient: patient._id,
                invoiceNumber:
                    `INV-${1001 + index}`,
                amount:
                    5000 + index * 2500,
                paymentMethod:
                    [
                        "cash",
                        "card",
                        "insurance",
                        "online"
                    ][index],
                status: "paid"
            }))
        );

        console.log("");
        console.log(
            "=========================================="
        );
        console.log(
            "   MEDICORE DASHBOARD SEED SUCCESS"
        );
        console.log(
            "=========================================="
        );
        console.log("Hospital: MediCore General Hospital");
        console.log("Patients: 4");
        console.log("Appointments: 4");
        console.log("Invoices: 4");
        console.log("Doctor: Dr. Ahmed Khan");
        console.log(
            "Revenue: PKR 35,000"
        );
        console.log(
            "=========================================="
        );

        await mongoose.disconnect();

    } catch (error) {
        console.error(
            "Dashboard seed failed:",
            error.message
        );

        await mongoose.disconnect();
        process.exit(1);
    }
}

seedDashboard();