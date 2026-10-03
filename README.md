# 🏥 MediCore — Healthcare Management & Analytics Platform

> **Connected Healthcare. Smarter Operations.**

MediCore is a full-stack healthcare management and analytics platform designed to centralize hospital operations, patient management, clinical workflows, pharmacy, laboratory services, billing, staff management, reporting, and administrative activities in one modern system.

The platform is designed with a modular architecture, responsive interface, role-aware workflows, REST APIs, MongoDB persistence, and a professional healthcare-focused user experience.

---

## ✨ Overview

Healthcare organizations often manage patients, doctors, appointments, medical records, prescriptions, laboratory tests, pharmacy inventory, billing, admissions, beds, staff, reports, and administrative operations across disconnected systems.

**MediCore** brings these workflows together into a unified platform.

The system provides dedicated modules for:

- 👤 Patient Management
- 👨‍⚕️ Doctor Management
- 🏢 Department Management
- 📅 Appointment Management
- 🩺 Medical Records
- 💊 Prescriptions
- 🏥 Admissions
- 🛏️ Bed Management
- 🚪 Discharges
- 💊 Pharmacy & Inventory
- 🧪 Laboratory
- 💰 Billing & Invoices
- 👥 Staff Management
- 🔐 Roles & Permissions
- 🔔 Notifications
- 📊 Analytics
- 📑 Reports
- 🔎 Global Search
- ⚡ Command Palette
- ⚙️ Settings
- 📝 Audit Logs

---

# 🚀 Key Features

## 📊 Dashboard

The MediCore dashboard provides a centralized operational overview with:

- Patient statistics
- Appointment information
- Admissions and discharges
- Billing indicators
- Bed information
- Recent activity
- Quick actions
- Analytics visualizations
- Quick navigation to major modules

---

## 👤 Patient Management

Manage the complete patient lifecycle through a dedicated patient management module.

### Features

- Add patients
- Edit patient information
- View patient details
- Delete patients
- Search patients
- Filter patient records
- Patient status management
- Patient-related operational information
- API-backed persistence

---

## 👨‍⚕️ Doctor Management

Dedicated doctor directory and management functionality.

### Features

- Doctor profiles
- Professional information
- Department association
- Contact information
- Doctor status
- Search and filtering
- Create, update, view and delete operations

---

## 🏢 Department Management

Manage hospital departments through a dedicated module.

### Features

- Create departments
- View departments
- Update departments
- Delete departments
- Department status
- Department information

---

## 📅 Appointment Management

Manage hospital appointments from a centralized interface.

### Features

- Create appointments
- Edit appointments
- View appointments
- Delete appointments
- Patient selection
- Doctor selection
- Date and time management
- Appointment status
- Search and filtering
- Date-based filtering
- Validation for appointment scheduling

---

## 🩺 Medical Records

Centralized medical record management for patient clinical information.

### Features

- Patient records
- Clinical information
- Medical history
- Diagnosis information
- Treatment information
- Record management
- Search and filtering

---

## 💊 Prescription Management

Manage prescriptions and medication instructions.

### Prescription Information

- Patient
- Doctor
- Prescription date
- Diagnosis
- Medicines
- Dosage
- Frequency
- Duration
- Instructions
- Refills
- Prescription status

---

## 🏥 Admissions

Manage inpatient admissions and hospital stays.

### Features

- Admission numbers
- Patient assignment
- Attending doctor
- Department
- Admission date
- Expected discharge date
- Admission type
- Priority
- Diagnosis
- Symptoms
- Ward
- Room
- Bed
- Notes
- Discharge information

---

## 🛏️ Bed Management

Monitor and manage hospital beds.

### Features

- Bed numbers
- Ward management
- Room numbers
- Bed types
- Bed status
- Patient assignment
- Admission association
- Floor information
- Assign bed
- Release bed
- Bed availability summary
- Occupied-bed protection

---

## 🚪 Discharge Management

Manage patient discharge workflows.

### Features

- Patient information
- Admission date
- Discharge date
- Diagnosis
- Treatment
- Procedures
- Medication
- Patient condition
- Follow-up information
- Discharge instructions
- Doctor information

---

## 💊 Pharmacy & Inventory

Manage pharmacy inventory and medication stock.

### Features

- Inventory management
- Medication information
- Stock quantities
- Inventory status
- Search and filtering
- Create inventory items
- Update inventory items
- Delete inventory items

---

## 🧪 Laboratory

Manage laboratory tests and related workflows.

### Features

- Laboratory test management
- Patient association
- Test information
- Test status
- Search and filtering
- Create, update and delete operations

---

## 💰 Billing & Invoices

Centralized invoice management for healthcare billing operations.

### Features

- Invoice creation
- Invoice numbers
- Patient association
- Invoice dates
- Due dates
- Invoice items
- Quantity
- Unit prices
- Discounts
- Taxes
- Total amount
- Paid amount
- Outstanding balance
- Payment methods
- Invoice status
- Billing summary

---

## 👥 Staff Management

Manage hospital staff through a dedicated staff directory.

### Staff Information

- Employee ID
- Name
- Profile photo
- Contact information
- Role
- Department
- Professional title
- Qualification
- Specialization
- Employment type
- Joining date
- Status
- Schedule
- Permissions
- Activity
- Last active information

---

## 🔐 Roles & Permissions

MediCore includes a dedicated roles and permissions management module.

The permission structure covers areas including:

- Dashboard
- Patients
- Doctors
- Appointments
- Medical Records
- Prescriptions
- Pharmacy
- Laboratory
- Billing
- Admissions
- Beds
- Discharges
- Staff
- Roles & Access
- Reports
- Analytics
- Settings
- Audit Logs

System roles have protection against inappropriate deletion or modification of their core identifiers.

---

## 🔔 Notifications

Centralized notification management with support for:

- In-app notifications
- Email channel configuration
- SMS channel configuration
- Push channel configuration
- Notification categories
- Read/unread state
- Mark as read
- Mark all as read
- Notification deletion
- Unread notification count

---

## 📊 Analytics

MediCore provides an analytics dashboard for operational and financial indicators.

### Analytics Areas

#### Patient Metrics

- New patients
- Active patients
- Appointments
- Admissions
- Discharges
- No-shows

#### Financial Metrics

- Revenue
- Collections
- Outstanding amounts

#### Operational Metrics

- Bed occupancy
- Laboratory volume

The analytics architecture is designed to support expansion into additional clinical and operational indicators.

---

## 📑 Reports

MediCore includes a configurable reporting module.

### Report Categories

- Patient
- Clinical
- Financial
- Pharmacy
- Laboratory
- Appointment
- Doctor
- Department
- Operations
- Audit

### Report Builder

Reports can be configured using:

- Report type
- Date range
- Filters
- Columns
- Grouping
- Sorting
- Report status

Supported report states include:

- Generating
- Ready
- Failed
- Expired

The reporting architecture is designed for future expansion into richer report generation and export workflows.

---

## 🔎 Global Search

MediCore provides global search functionality across major healthcare entities.

Searchable areas include:

- Patients
- Doctors
- Appointments
- Invoices
- Pharmacy inventory
- Laboratory tests
- Prescriptions
- Reports

### Search Features

- Global search
- Grouped results
- Keyboard shortcut
- Search loading state
- Empty-state handling
- Keyboard navigation
- Enter to open
- Escape to close

---

## ⚡ Command Palette

MediCore includes a command palette for fast navigation and actions.

Available commands include:

- Add Patient
- Add Doctor
- Book Appointment
- Create Prescription
- Create Invoice
- Order Lab Test
- Generate Report
- Open Analytics
- Open Settings
- Logout

### Keyboard Controls

| Key | Action |
|---|---|
| `Ctrl + K` | Open command palette |
| `↑` | Previous command |
| `↓` | Next command |
| `Enter` | Execute command |
| `Esc` | Close |

---

## 📝 Audit Logs

MediCore includes an audit logging architecture for tracking system activity.

### Captured Information

- Actor
- Module
- Action
- Target
- Status
- IP address
- User agent
- Previous state
- New state
- Metadata
- Timestamp

Audit logs support filtering, searching, pagination, and activity inspection.

---

# 🔐 Authentication

MediCore uses token-based authentication with JWT.

Authentication infrastructure includes:

- JWT authentication
- Protected API routes
- Password hashing with bcrypt
- Token-based authorization
- Authentication middleware
- Session-aware frontend API requests

---

# 🏗️ Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons
- Axios
- Chart.js

## Backend

- Node.js
- Express.js
- REST APIs
- JWT
- bcryptjs
- Express Validator
- Helmet
- CORS
- Morgan
- Nodemailer

## Database

- MongoDB
- MongoDB Atlas
- Mongoose

## Development Tools

- Visual Studio Code
- Git
- GitHub
- npm
- Nodemon
- Postman

---

# 📁 Project Structure

```text
medicore/
│
├── backend/
│   │
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   │
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── dashboard.css
│   │   ├── responsive.css
│   │   └── ...
│   │
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── app.js
│   │   ├── dashboard.js
│   │   └── ...
│   │
│   └── pages/
│       ├── dashboard.html
│       ├── patients.html
│       ├── doctors.html
│       ├── departments.html
│       ├── staff.html
│       ├── appointments.html
│       ├── medical-records.html
│       ├── prescriptions.html
│       ├── admissions.html
│       ├── beds.html
│       ├── discharges.html
│       ├── pharmacy.html
│       ├── laboratory-tests.html
│       ├── billing.html
│       ├── analytics.html
│       ├── reports.html
│       ├── notifications.html
│       ├── roles.html
│       ├── settings.html
│       └── audit-logs.html
│
├── .gitignore
└── README.md
