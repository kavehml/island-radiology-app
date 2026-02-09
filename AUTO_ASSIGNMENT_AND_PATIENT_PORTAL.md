# Automatic Center Assignment & Patient Portal

This document describes the new features for automatic requisition assignment and the patient portal.

## Features Implemented

### 1. Automatic Center Assignment

When a requisition is approved, the system automatically assigns it to the optimal imaging center based on:

- **Equipment Availability** (0-30 points): Checks if the site has the required equipment (CT, MRI, etc.) and availability over the next 7 days
- **Radiologist Availability** (0-25 points): Evaluates radiologist coverage at each site
- **Workload** (0-20 points): Considers current pending and scheduled orders (lower workload = higher score)
- **Priority Match** (0-25 points): Prioritizes sites that can handle time-sensitive and urgent requests

The system scores all candidate sites and assigns the requisition to the highest-scoring site.

#### Implementation Details

- **Service**: `backend/src/services/requisitionRouter.ts`
- **Trigger**: Automatically runs when a requisition is approved via `/api/requisitions/:id/approve`
- **Database Fields Added**:
  - `assigned_site_id`: References the assigned site
  - `assigned_at`: Timestamp of assignment
  - `assignment_reason`: Explanation of why this site was chosen

### 2. Patient Portal

A public-facing portal where patients can view their requisition status and assigned imaging center.

#### Features

- **Authentication**: Patients authenticate using:
  - Requisition number (e.g., REQ-20260208-000001)
  - Date of birth (must match the requisition)

- **Information Displayed**:
  - Requisition status (pending, approved, rejected, converted)
  - Order details (type, body part, priority)
  - Assigned imaging center (name and address)
  - Assignment reason and timestamp
  - Review information (if reviewed)

#### Access

- **URL**: `http://localhost:3000/patient-portal`
- **Public**: No login required (uses requisition number + DOB authentication)

#### API Endpoints

- `POST /api/patient-portal/authenticate` - Authenticate patient
- `GET /api/patient-portal/requisition/:requisitionNumber` - Get requisition details
- `GET /api/patient-portal/requisitions?email=...&phone=...` - Get all requisitions for a patient

## Setup Instructions

### 1. Run Database Migration

```bash
psql -U <your_postgres_user> -d radiology_app -f database/migrations/add_assigned_site_to_requisitions.sql
```

This adds the following columns to the `requisitions` table:
- `assigned_site_id` (INTEGER, references sites)
- `assigned_at` (TIMESTAMP)
- `assignment_reason` (TEXT)

### 2. Restart Backend Server

The backend needs to be restarted to load the new routes and services:

```bash
cd backend
npm run dev
```

### 3. Access Patient Portal

Navigate to: `http://localhost:3000/patient-portal`

## Usage Examples

### Approving a Requisition (Auto-Assignment)

When an admin approves a requisition:

```bash
POST /api/requisitions/:id/approve
Authorization: Bearer <admin_token>
Body: { "reviewNotes": "Approved for scheduling" }
```

The response includes:
- Standard requisition data
- `assigned_site_id`: ID of assigned site
- `assigned_site_name`: Name of assigned site
- `assignment_reason`: Why this site was chosen
- `routing_score`: Score used for assignment

### Patient Viewing Their Requisition

1. Patient navigates to `/patient-portal`
2. Enters requisition number and date of birth
3. Views requisition details including assigned center

## Technical Details

### Requisition Router Service

The `RequisitionRouter` service (`backend/src/services/requisitionRouter.ts`) implements intelligent routing:

1. **Filters Sites**: Only considers sites with the required equipment
2. **Scores Each Site**: Calculates scores based on multiple factors
3. **Selects Best Site**: Chooses the highest-scoring site
4. **Assigns & Logs**: Updates requisition and provides reasoning

### Patient Portal Controller

The `patientPortalController` (`backend/src/controllers/patientPortalController.ts`) handles:

- Patient authentication (requisition number + DOB verification)
- Retrieving requisition details (with site information)
- Filtering requisitions by patient email/phone

### Frontend Components

- **PatientPortal.tsx**: Main portal component with authentication form and requisition display
- **PatientPortal.css**: Styling for the patient portal

## Future Enhancements

Potential improvements:

1. **Email Notifications**: Send email to patient when requisition is assigned
2. **SMS Notifications**: Text message when center is assigned
3. **Appointment Scheduling**: Allow patients to schedule appointments at assigned center
4. **Multiple Requisitions**: View all requisitions for a patient in one place
5. **Document Upload**: Allow patients to upload required documents
6. **Reminders**: Send reminders before scheduled appointments

## Troubleshooting

### Requisition Not Auto-Assigned

- Check that sites have the required equipment configured
- Verify that at least one site has the equipment type needed
- Check backend logs for routing errors

### Patient Portal Authentication Fails

- Verify requisition number format (REQ-YYYYMMDD-######)
- Ensure date of birth matches exactly (YYYY-MM-DD format)
- Check that `patient_dob` is set on the requisition

### No Sites Available

- Ensure sites are created in the system
- Verify facilities are added to sites with equipment quantities > 0
- Check that equipment types match requisition order types
