# Portal Links and Access Guide

## Public Links (No Login Required)

### 1. **Patient Portal** - For Patients
**URL:** `https://island-radiology-app-production-f282.up.railway.app/patient-portal`

**Purpose:** Patients can check the status of their imaging requisitions

**How to Use:**
- Enter Requisition Number (provided after submission)
- Enter Patient Date of Birth
- View status, assigned imaging center, and other details

**What They Can See:**
- Requisition status (Pending, Approved, Rejected, Converted)
- Patient name and order details
- Assigned imaging center (if approved)
- Assignment reason
- Review notes (if reviewed)

---

### 2. **Requisition Submission Form** - For Physicians & Office Staff
**URL:** `https://island-radiology-app-production-f282.up.railway.app/requisition-submit`

**Purpose:** Submit new imaging requisitions

**How to Use:**
- Fill out patient information
- Fill out referring physician information
- Select imaging type and provide clinical details
- Provide submitter information (name and email for confirmation)
- Submit and receive requisition number

**What Happens:**
- Receives requisition number immediately
- Confirmation email sent to submitter (if email provided)
- Requisition appears in admin dashboard for review

---

## Admin/Staff Links (Login Required)

### 3. **Admin Dashboard** - For Administrators & Staff
**URL:** `https://island-radiology-app-production-f282.up.railway.app/login`

**After Login, Access:**
- **Requisitions Page** (`/requisitions`): View all requisitions, approve/reject, convert to orders
- **Orders Page** (`/orders`): Manage imaging orders
- **Sites Page** (`/sites`): Manage imaging centers
- **Radiologists Page** (`/radiologists`): Manage radiologists and schedules
- **Calendar** (`/calendar`): View radiologist schedules
- **Optimization** (`/optimization`): Optimize workload and combine orders

**Login Credentials:**
- Admin: `admin@islandradiology.com` / `admin123`
- Staff: `staff@islandradiology.com` / `staff123`

---

## Current Status Summary

✅ **Patients** - Have access via Patient Portal (public, no login)
✅ **Administrators** - Have full access via admin dashboard (login required)
⚠️ **Non-Radiology Doctors** - Can use Patient Portal with requisition number, but no dedicated physician portal

---

## Recommendations

### Option 1: Use Existing Patient Portal
**For Referring Physicians:** They can use the Patient Portal with:
- Requisition number (from confirmation email)
- Patient's date of birth

**Pros:** Already implemented, no additional work needed
**Cons:** Requires requisition number for each check, can't see all their requisitions at once

### Option 2: Create Physician Portal (Future Enhancement)
**For Referring Physicians:** A dedicated portal where they can:
- Log in with their email/NPI
- See all requisitions they've submitted
- Filter by patient, status, date range
- No need to remember requisition numbers

**Pros:** Better user experience for frequent users
**Cons:** Requires additional development

---

## Quick Reference Links

**Share these links with users:**

1. **For Patients:**
   ```
   https://island-radiology-app-production-f282.up.railway.app/patient-portal
   ```

2. **For Physicians/Office Staff (Submit Requisitions):**
   ```
   https://island-radiology-app-production-f282.up.railway.app/requisition-submit
   ```

3. **For Administrators:**
   ```
   https://island-radiology-app-production-f282.up.railway.app/login
   ```

---

## Email Confirmations

When a requisition is submitted with an email address:
- ✅ Confirmation email is sent automatically
- ✅ Email includes requisition number
- ✅ Email includes patient name and order type
- ✅ Email includes instructions for checking status

**Note:** Email functionality requires SMTP configuration (see `EMAIL_SETUP.md`)
