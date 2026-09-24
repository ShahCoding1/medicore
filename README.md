# MediCore — Healthcare Management & Analytics Platform

> **Connected Healthcare. Smarter Operations.**

MediCore is a full-stack healthcare management and analytics platform designed to bring essential hospital operations into one centralized system.

The platform is being developed with a focus on patient management, doctors, appointments, medical records, pharmacy operations, laboratory workflows, billing, admissions, analytics, reporting, staff management, notifications, and administration.

---

## 🚧 Project Status

**MediCore is currently under active development.**

This project is **not yet a finished production-ready healthcare system**. Features are being implemented progressively according to the project's development roadmap.

The development follows a structured phase-by-phase approach. Each phase is implemented, tested, verified, and refined before moving to the next phase.



## 🎯 Project Vision

MediCore aims to provide a centralized healthcare operations platform that connects:

- Patients
- Doctors
- Nurses
- Receptionists
- Pharmacists
- Laboratory Staff
- Accountants
- Hospital Administrators

The long-term goal is to provide a unified environment where healthcare organizations can manage daily operations, clinical workflows, administrative tasks, and operational analytics from one platform.

---

## ✨ Planned Features

### 🏥 Hospital Management

- Hospital profile management
- Hospital workspace
- Multiple hospital support
- Departments
- Staff management
- Hospital preferences
- Administrative settings

### 👨‍⚕️ Patient Management

- Patient registration
- Unique patient IDs
- Patient search
- Patient filtering
- Patient status management
- Patient information
- Department assignment
- Patient records

### 👨‍⚕️ Doctor Management

- Doctor profiles
- Doctor departments
- Doctor availability
- Doctor-patient relationships
- Doctor appointment management

### 📅 Appointment Management

- Appointment scheduling
- Patient-doctor assignment
- Appointment status
- Appointment timeline
- Daily appointment overview

### 🩺 Clinical Management

- Medical records
- Prescriptions
- Admissions
- Discharges
- Bed management
- Clinical workflows

### 💊 Pharmacy

- Medicine management
- Pharmacy inventory
- Prescription management
- Stock tracking
- Pharmacy operations

### 🧪 Laboratory

- Laboratory tests
- Test orders
- Test results
- Laboratory workflow management

### 💳 Billing & Finance

- Invoice management
- Payment tracking
- Payment methods
- Revenue tracking
- Billing records

### 📊 Analytics & Reports

- Operational dashboards
- Patient growth
- Revenue analytics
- Appointment analytics
- Department performance
- Bed occupancy
- Payment analytics
- Reports

### 🔐 Administration & Security

- Authentication
- JWT-based authorization
- Role-based access control
- Permissions
- User management
- Security settings
- Audit logs

### 🔎 Productivity

- Global search
- Command palette
- Notifications
- Help center
- Profile management
- Hospital switching

---

## 🖥️ Current Dashboard

The MediCore dashboard provides an operational overview of the hospital environment.

Current dashboard functionality includes:

- Patient statistics
- Doctor statistics
- Appointment statistics
- Revenue overview
- Patient growth chart
- Revenue chart
- Recent patients
- Today's appointment timeline
- Dashboard API integration
- MongoDB-backed data
- Responsive application shell

---

## 👥 User Roles

The planned platform supports multiple healthcare roles:

| Role | Purpose |
|------|---------|
| Super Admin | Platform-level administration |
| Hospital Admin | Hospital administration |
| Doctor | Clinical and patient management |
| Nurse | Clinical operations |
| Receptionist | Registration and appointments |
| Pharmacist | Pharmacy operations |
| Lab Technician | Laboratory operations |
| Accountant | Billing and financial operations |

Role-based functionality will continue to be implemented throughout development.

---

## 🛠️ Technology Stack

### Frontend

- HTML5
- CSS3
- Bootstrap 5
- JavaScript
- Axios
- Chart.js

### Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcryptjs
- Express Validator
- Helmet
- Morgan

### Database

- MongoDB
- MongoDB Atlas
- Mongoose

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- Nodemon

---

## 🏗️ Architecture

MediCore follows a separated frontend/backend architecture:

```text
MediCore
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   └── server.js
│
└── frontend
    ├── assets
    ├── css
    ├── js
    ├── pages
    └── index.html
